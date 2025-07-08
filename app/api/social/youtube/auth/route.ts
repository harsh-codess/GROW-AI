import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

// Configure Google OAuth2 client
console.log(process.env.YOUTUBE_REDIRECT_URL);
console.log(process.env.GOOGLE_CLIENT_ID);
console.log(process.env.GOOGLE_CLIENT_SECRET);
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URL
);


console.log("hello",  process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URL)
// Define the scopes
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid",
];

// GET - Generate YouTube auth URL
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
      include_granted_scopes: true,
    });

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Error generating YouTube auth URL:", error);
    return NextResponse.json(
      { message: "An error occurred while generating the authorization URL" },
      { status: 500 }
    );
  }
}

// POST - Exchange code for tokens
export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    oauth2Client.setCredentials(tokens);

    // Calculate token expiry time
    let expiryDate;
    if (tokens.expiry_date) {
      expiryDate = new Date(tokens.expiry_date);
    } else if (tokens.expires_in) {
      expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expires_in);
    } else {
      expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
    }

    // Get YouTube channel data
    const youtube = google.youtube("v3");
    const channelResponse = await youtube.channels.list({
      auth: oauth2Client,
      part: ["snippet", "statistics", "brandingSettings", "contentDetails", "status"],
      mine: true,
    });

    if (!channelResponse.data.items?.length) {
      return NextResponse.json(
        { message: "No YouTube channel found for this account" },
        { status: 404 }
      );
    }

    const channel = channelResponse.data.items[0];

    // Store in database - first check if connection already exists
    const existingConnection = await prisma.socialConnection.findFirst({
      where: {
        userId: sessionUser.id,
        platform: "youtube",
      },
    });

    if (existingConnection) {
      // Update existing connection
      await prisma.socialConnection.update({
        where: { id: existingConnection.id },
        data: {
          isEnabled: true,
          isVerified: true,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: tokens.token_type,
          tokenExpiry: expiryDate,
          scope: tokens.scope,
          platformUserId: channel.id,
          platformUsername: channel.snippet?.customUrl || channel.snippet?.title,
          lastFetch: new Date(),
        },
      });
    } else {
      // Create new connection
      await prisma.socialConnection.create({
        data: {
          userId: sessionUser.id,
          platform: "youtube",
          isEnabled: true,
          isVerified: true,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: tokens.token_type,
          tokenExpiry: expiryDate,
          scope: tokens.scope,
          platformUserId: channel.id,
          platformUsername: channel.snippet?.customUrl || channel.snippet?.title,
          lastFetch: new Date(),
        },
      });
    }

    // Format channel data for response
    const formattedResponse = {
      channel: {
        id: channel.id,
        title: channel.snippet?.title,
        description: channel.snippet?.description,
        customUrl: channel.snippet?.customUrl,
        thumbnails: channel.snippet?.thumbnails,
        statistics: {
          viewCount: parseInt(channel.statistics?.viewCount) || 0,
          subscriberCount: parseInt(channel.statistics?.subscriberCount) || 0,
          videoCount: parseInt(channel.statistics?.videoCount) || 0,
        },
        banner: channel.brandingSettings?.image?.bannerExternalUrl,
      },
      videos: [],
    };

    return NextResponse.json({
      message: "YouTube account connected successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error connecting YouTube account:", error);
    return NextResponse.json(
      { message: "An error occurred while connecting your YouTube account" },
      { status: 500 }
    );
  }
}