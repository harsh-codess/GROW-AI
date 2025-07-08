import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import axios from "axios";
import { prisma } from "@/lib/prisma";

// GET - Fetch Instagram data
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

    // Check if user has an Instagram connection
    const connection = await prisma.socialConnection.findFirst({
      where: {
        userId: sessionUser.id,
        platform: "instagram",
        isEnabled: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { message: "Please connect your Instagram account first" },
        { status: 404 }
      );
    }

    // Check if we should use cached data
    if (!forceRefresh) {
      const cachedData = await prisma.analyticsData.findFirst({
        where: {
          userId: sessionUser.id,
          platform: "instagram",
          dataType: "profile_with_media",
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
          message: "Instagram data fetched from cache",
          data: cachedData.data,
        });
      }
    }

    // If token is expired, we need to refresh it
    if (connection.tokenExpiry && new Date() > connection.tokenExpiry) {
      const refreshResult = await refreshInstagramToken(connection.accessToken!);
      
      if (!refreshResult) {
        // Token refresh failed, mark connection as disabled
        await prisma.socialConnection.update({
          where: { id: connection.id },
          data: {
            isEnabled: false,
          },
        });

        return NextResponse.json(
          { message: "Instagram authentication expired. Please reconnect your account." },
          { status: 401 }
        );
      }

      // Update connection with new token
      await prisma.socialConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: refreshResult.access_token,
          tokenExpiry: refreshResult.expires_at,
        },
      });

      // Update the token for this request
      connection.accessToken = refreshResult.access_token;
    }

    // Initialize return data object with defaults
    const returnData = {
      profile: {
        id: connection.platformUserId,
        username: connection.platformUsername || null,
        account_type: connection.accountType || "PERSONAL",
        name: null,
        website: null,
        biography: "",
        followers_count: 0,
        follows_count: 0,
        media_count: 0,
        profile_picture_url: null,  
      },
      media: [],
    };

    // Step 1: Get basic profile info
    try {
      const basicInfo = await axios.get(`https://graph.instagram.com/me`, {
        params: {
          fields: "biography,followers_count,follows_count,media_count,name,profile_picture_url,username,website,account_type",
          access_token: connection.accessToken,
        },
      });

      if (basicInfo.data) {
        returnData.profile.name = basicInfo.data.name || "";
        returnData.profile.website = basicInfo.data.website || null;
        returnData.profile.username = basicInfo.data.username;
        returnData.profile.account_type = basicInfo.data.account_type || "PERSONAL";
        returnData.profile.biography = basicInfo.data.biography || "";
        returnData.profile.followers_count = basicInfo.data.followers_count || 0;
        returnData.profile.follows_count = basicInfo.data.follows_count || 0;
        returnData.profile.media_count = basicInfo.data.media_count || 0;
        returnData.profile.profile_picture_url = basicInfo.data.profile_picture_url || "";
      }
    } catch (error) {
      console.error("Error fetching Instagram profile:", error);
      // Continue with partial data
    }

    // Step 2: Get media data
    try {
      const mediaResponse = await axios.get(`https://graph.instagram.com/me/media`, {
        params: {
          fields: "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,comments_count,like_count,play_count",
          access_token: connection.accessToken,
        },
      });

      if (mediaResponse.data && mediaResponse.data.data) {
        returnData.media = mediaResponse.data.data;
      }
    } catch (error) {
      console.error("Error fetching Instagram media:", error);
      // Continue with profile data only
    }

    // Cache the data
    // Delete any existing cached data
    await prisma.analyticsData.deleteMany({
      where: {
        userId: sessionUser.id,
        platform: "instagram",
        dataType: "profile_with_media",
      },
    });

    // Calculate expiry (3 hours from now)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 3);

    // Store in cache
    await prisma.analyticsData.create({
      data: {
        userId: sessionUser.id,
        platform: "instagram",
        dataType: "profile_with_media",
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
      message: "Instagram data fetched successfully",
      data: returnData,
    });
  } catch (error) {
    console.error("Error fetching Instagram data:", error);

    if (error.response?.status === 401) {
      return NextResponse.json(
        { message: "Instagram authentication expired. Please reconnect your account." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred while fetching Instagram data" },
      { status: 500 }
    );
  }
}

// Helper function to refresh Instagram token
async function refreshInstagramToken(accessToken: string) {
  try {
    const response = await axios.get(
      `https://graph.instagram.com/refresh_access_token`,
      {
        params: {
          grant_type: "ig_refresh_token",
          access_token: accessToken,
        },
      }
    );

    if (!response.data || !response.data.access_token) {
      return null;
    }

    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + response.data.expires_in);

    return {
      access_token: response.data.access_token,
      expires_at: expiryDate,
    };
  } catch (error) {
    console.error("Error refreshing Instagram token:", error);
    return null;
  }
}