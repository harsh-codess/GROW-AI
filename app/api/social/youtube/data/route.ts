import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

// Configure Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URL
);

// GET - Fetch YouTube data
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
    const pageToken = url.searchParams.get("pageToken") || null;
    const maxResults = parseInt(url.searchParams.get("limit") || "10");

    // Check if user has a YouTube connection
    const connection = await prisma.socialConnection.findFirst({
      where: {
        userId: sessionUser.id,
        platform: "youtube",
        isEnabled: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { message: "Please connect your YouTube account first" },
        { status: 404 }
      );
    }

    // Check if we should use cached data
    if (!forceRefresh) {
      const cachedData = await prisma.analyticsData.findFirst({
        where: {
          userId: sessionUser.id,
          platform: "youtube",
          dataType: "channel_with_videos",
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
          message: "YouTube data fetched from cache",
          data: cachedData.data,
        });
      }
    }

    // Check if the token is expired
    if (connection.tokenExpiry && new Date() > connection.tokenExpiry) {
      // Refresh the token
      const refreshResponse = await refreshYoutubeToken(connection.refreshToken!);
      
      if (!refreshResponse) {
        // Token refresh failed, mark connection as disabled
        await prisma.socialConnection.update({
          where: { id: connection.id },
          data: {
            isEnabled: false,
          },
        });

        return NextResponse.json(
          { message: "YouTube authentication expired. Please reconnect your account." },
          { status: 401 }
        );
      }

      // Update connection with new token
      await prisma.socialConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: refreshResponse.access_token,
          tokenExpiry: refreshResponse.expiry,
        },
      });

      // Update the token for this request
      connection.accessToken = refreshResponse.access_token;
    }

    // Set the credentials
    oauth2Client.setCredentials({
      access_token: connection.accessToken!,
      refresh_token: connection.refreshToken,
      token_type: connection.tokenType,
      scope: connection.scope,
    });

    // Get channel data
    const youtube = google.youtube("v3");
    const channelResponse = await youtube.channels.list({
      auth: oauth2Client,
      part: ["snippet", "statistics", "brandingSettings", "contentDetails"],
      id: [connection.platformUserId],
    });

    if (!channelResponse.data.items?.length) {
      return NextResponse.json(
        { message: "YouTube channel not found" },
        { status: 404 }
      );
    }

    const channel = channelResponse.data.items[0];

    // Get videos
    const searchParams: any = {
      auth: oauth2Client,
      channelId: connection.platformUserId,
      part: ["snippet"],
      order: "date",
      type: "video",
      maxResults: maxResults,
    };

    if (pageToken) {
      searchParams.pageToken = pageToken;
    }

    const videosResponse = await youtube.search.list(searchParams);

    // If we have videos, get their detailed stats
    let videos = [];
    let nextPageToken = videosResponse.data.nextPageToken || null;

    if (videosResponse.data.items?.length) {
      const videoIds = videosResponse.data.items.map(
        (item) => item.id!.videoId!
      );

      const videoDetailsResponse = await youtube.videos.list({
        auth: oauth2Client,
        part: ["statistics", "contentDetails", "snippet", "status"],
        id: videoIds,
      });

      // Format the videos
      videos = videosResponse.data.items.map((video) => {
        const videoId = video.id!.videoId!;
        const videoDetails = videoDetailsResponse.data.items?.find(
          (item) => item.id === videoId
        );

        return {
          id: videoId,
          title: video.snippet?.title,
          description: video.snippet?.description,
          thumbnail: video.snippet?.thumbnails?.high,
          publishedAt: video.snippet?.publishedAt,
          statistics: {
            viewCount: parseInt(videoDetails?.statistics?.viewCount || "0"),
            likeCount: parseInt(videoDetails?.statistics?.likeCount || "0"),
            commentCount: parseInt(videoDetails?.statistics?.commentCount || "0"),
          },
        };
      });
    }

    // Create formatted response
    const formattedResponse = {
      channel: {
        id: channel.id,
        title: channel.snippet?.title,
        description: channel.snippet?.description,
        customUrl: channel.snippet?.customUrl,
        thumbnails: channel.snippet?.thumbnails,
        statistics: {
          viewCount: parseInt(channel.statistics?.viewCount || "0"),
          subscriberCount: parseInt(channel.statistics?.subscriberCount || "0"),
          videoCount: parseInt(channel.statistics?.videoCount || "0"),
        },
        banner: channel.brandingSettings?.image?.bannerExternalUrl,
      },
      videos: videos,
      nextPageToken: nextPageToken,
      totalVideos: parseInt(channel.statistics?.videoCount || "0"),
    };

    // Cache the data (except for paginated requests)
    if (!pageToken) {
      // Delete any existing cached data
      await prisma.analyticsData.deleteMany({
        where: {
          userId: sessionUser.id,
          platform: "youtube",
          dataType: "channel_with_videos",
        },
      });

      // Calculate expiry (3 hours from now)
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 3);

      // Store in cache
      await prisma.analyticsData.create({
        data: {
          userId: sessionUser.id,
          platform: "youtube",
          dataType: "channel_with_videos",
          data: formattedResponse,
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
    }

    return NextResponse.json({
      message: "YouTube data fetched successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching YouTube data:", error);

    if (error.response?.status === 401) {
      return NextResponse.json(
        { message: "YouTube authentication expired. Please reconnect your account." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred while fetching YouTube data" },
      { status: 500 }
    );
  }
}

// Helper function to refresh YouTube token
async function refreshYoutubeToken(refreshToken: string) {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const response = await oauth2Client.refreshAccessToken();
    const tokens = response.credentials;

    // Calculate expiry
    let expiry;
    if (tokens.expiry_date) {
      expiry = new Date(tokens.expiry_date);
    } else if (tokens.expires_in) {
      expiry = new Date();
      expiry.setSeconds(expiry.getSeconds() + tokens.expires_in);
    } else {
      expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);
    }

    return {
      access_token: tokens.access_token,
      expiry: expiry,
    };
  } catch (error) {
    console.error("Error refreshing YouTube token:", error);
    return null;
  }
}