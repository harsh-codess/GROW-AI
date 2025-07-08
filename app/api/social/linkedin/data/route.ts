import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import axios from "axios";
import { prisma } from "@/lib/prisma";

// GET - Fetch LinkedIn data
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("force") === "true";

    // Check if user has a LinkedIn connection
    const connection = await prisma.socialConnection.findFirst({
      where: {
        userId: sessionUser.id,
        platform: "linkedin",
        isEnabled: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { message: "Please connect your LinkedIn account first" },
        { status: 404 }
      );
    }

    // Check if we should use cached data
    if (!forceRefresh) {
      const cachedData = await prisma.analyticsData.findFirst({
        where: {
          userId: sessionUser.id,
          platform: "linkedin",
          dataType: "profile",
          expiry: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (cachedData) {
        return NextResponse.json({
          message: "LinkedIn data fetched from cache",
          data: cachedData.data,
        });
      }
    }

    // Initialize return data
    const returnData: any = {
      profile: {
        id: connection.platformUserId,
        name: connection.platformUsername || '',
        headline: '',
        profilePicture: '',
        connections: 0,
        industry: '',
        location: ''
      },
      posts: []
    };

    // Fetch LinkedIn profile data
    try {
      const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      const profileData = profileResponse.data;
      
      // Update basic profile info
      if (profileData.localizedFirstName && profileData.localizedLastName) {
        returnData.profile.name = `${profileData.localizedFirstName} ${profileData.localizedLastName}`;
      }
      
      // Get profile picture
      try {
        const pictureResponse = await axios.get('https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))', {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        
        const pictureData = pictureResponse.data;
        if (pictureData.profilePicture && 
            pictureData.profilePicture['displayImage~'] && 
            pictureData.profilePicture['displayImage~'].elements && 
            pictureData.profilePicture['displayImage~'].elements.length > 0) {
          
          // Get the largest image
          const largestImage = pictureData.profilePicture['displayImage~'].elements
            .reduce((largest: any, current: any) => {
              if (!largest || (current.data.width.value > largest.data.width.value)) {
                return current;
              }
              return largest;
            }, null);
            
          if (largestImage && largestImage.identifiers) {
            returnData.profile.profilePicture = largestImage.identifiers[0].identifier;
          }
        }
      } catch (pictureError) {
        console.error("Error fetching LinkedIn profile picture:", pictureError);
        // Continue without profile picture
      }
      
      // Get additional profile info like headline, industry, and location
      try {
        const extendedProfileResponse = await axios.get('https://api.linkedin.com/v2/me?projection=(id,headline,industry,location)', {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        
        const extendedData = extendedProfileResponse.data;
        if (extendedData.headline) {
          returnData.profile.headline = extendedData.headline;
        }
        
        if (extendedData.industry) {
          returnData.profile.industry = extendedData.industry;
        }
        
        if (extendedData.location) {
          returnData.profile.location = extendedData.location.preferredLocale?.country || '';
          if (extendedData.location.preferredLocale?.language) {
            returnData.profile.location += ` (${extendedData.location.preferredLocale.language})`;
          }
        }
      } catch (extendedProfileError) {
        console.error("Error fetching extended LinkedIn profile:", extendedProfileError);
        // Continue without extended profile info
      }
      
      // Get connection count (note: might require specific permissions)
      try {
        const connectionsResponse = await axios.get('https://api.linkedin.com/v2/connections?q=viewer&count=0', {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        
        if (connectionsResponse.data && connectionsResponse.data._total) {
          returnData.profile.connections = connectionsResponse.data._total;
        }
      } catch (connectionsError) {
        console.error("Error fetching LinkedIn connections:", connectionsError);
        // Continue without connections data
      }
    } catch (profileError) {
      console.error("Error fetching LinkedIn profile:", profileError);
      // Continue with partial data
    }
    
    // Attempt to fetch user's recent posts (if we have the necessary permissions)
    try {
      const postsResponse = await axios.get('https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Aperson%3A' + connection.platformUserId + ')', {
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      if (postsResponse.data && postsResponse.data.elements && postsResponse.data.elements.length > 0) {
        // Format posts
        returnData.posts = postsResponse.data.elements.map((post: any) => {
          return {
            id: post.id,
            text: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
            created: post.created?.time || null,
            lastModified: post.lastModified?.time || null,
            visibility: post.visibility?.['com.linkedin.ugc.MemberNetworkVisibility'] || 'CONNECTIONS',
            commentsSummary: post.commentsSummary || { totalComments: 0 },
            likesSummary: post.likesSummary || { totalLikes: 0 }
          };
        });
      }
    } catch (postsError) {
      console.error("Error fetching LinkedIn posts:", postsError);
      // Continue without posts data
    }
    
    // Cache the data
    // Delete any existing cached data
    await prisma.analyticsData.deleteMany({
      where: {
        userId: sessionUser.id,
        platform: "linkedin",
        dataType: "profile",
      },
    });

    // Calculate expiry (3 hours from now)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 3);

    // Store in cache
    await prisma.analyticsData.create({
      data: {
        userId: sessionUser.id,
        platform: "linkedin",
        dataType: "profile",
        data: returnData,
        expiry: expiry,
      },
    });

    // Update last fetch time
    await prisma.socialConnection.update({
      where: { id: connection.id },
      data: {
        lastFetch: new Date(),
      },
    });

    return NextResponse.json({
      message: "LinkedIn data fetched successfully",
      data: returnData,
    });
  } catch (error) {
    console.error("Error fetching LinkedIn data:", error);

    if (error.response?.status === 401) {
      return NextResponse.json(
        { message: "LinkedIn authentication expired. Please reconnect your account." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred while fetching LinkedIn data" },
      { status: 500 }
    );
  }
}