import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import axios from "axios";
import { prisma } from "@/lib/prisma";

// GET - Generate Instagram auth URL
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user agent to detect iOS Safari for special handling
    const userAgent = request.headers.get("user-agent") || "";
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(userAgent);
    const isIOSSafari = isIOS && isSafari;

    console.log(`[INSTA AUTH URL] User-Agent: ${userAgent}`);
    console.log(
      `[INSTA AUTH URL] Detected: isIOS=${isIOS}, isSafari=${isSafari}, isIOSSafari=${isIOSSafari}`
    );

    const authBase = "https://api.instagram.com/oauth/authorize";
    // Make sure these scopes match your Instagram App configuration
    const scopes = "instagram_basic,instagram_content_publish";

    // Ensure the redirect URI is correct
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    if (!redirectUri) {
      console.error("[FATAL] INSTAGRAM_REDIRECT_URI environment variable is not set!");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Base parameters
    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID || "",
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: "code",
    });

    // Add iOS Safari specific parameters to try and prevent app switching
    if (isIOSSafari) {
      console.log("[INSTA AUTH URL] Applying iOS Safari specific params to URL");
      params.append("force_authentication", "true");
      params.append("skip_app_switch", "true");
    }

    const authUrl = `${authBase}?${params.toString()}`;
    console.log(`[INSTA AUTH URL] Generated URL: ${authUrl}`);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Error generating Instagram auth URL:", error);
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

    // Normalize the code (trim whitespace and remove any URL encoding artifacts)
    const normalizedCode = decodeURIComponent(code.trim());

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      {
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code: normalizedCode,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!tokenResponse.data || !tokenResponse.data.access_token) {
      return NextResponse.json(
        { message: "Failed to obtain access token from Instagram" },
        { status: 500 }
      );
    }

    const shortLivedToken = tokenResponse.data.access_token;
    const instagramUserId = tokenResponse.data.user_id;

    // Exchange short-lived token for long-lived token (60 days validity)
    const longLivedTokenResponse = await axios.get(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`
    );

    if (!longLivedTokenResponse.data || !longLivedTokenResponse.data.access_token) {
      return NextResponse.json(
        { message: "Failed to exchange for long-lived token" },
        { status: 500 }
      );
    }

    const longLivedToken = longLivedTokenResponse.data.access_token;
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(
      tokenExpiry.getSeconds() + longLivedTokenResponse.data.expires_in
    );

    // Get user profile info
    let instagramUsername = null;
    let accountType = "PERSONAL"; // Default to personal if we can't determine

    try {
      // Get basic profile information
      const basicProfileResponse = await axios.get(
        `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${longLivedToken}`
      );

      if (basicProfileResponse.data && basicProfileResponse.data.username) {
        instagramUsername = basicProfileResponse.data.username;
        if (basicProfileResponse.data.account_type) {
          accountType = basicProfileResponse.data.account_type;
        }
      }
    } catch (profileError) {
      console.error(
        "Error fetching basic profile:",
        profileError.response?.data || profileError.message
      );

      // If we don't have a username, use a default or the user ID as username
      if (!instagramUsername) {
        instagramUsername = `instagram_user_${instagramUserId.substring(0, 6)}`;
      }
    }

    // Store in database - first check if connection already exists
    const existingConnection = await prisma.socialConnection.findFirst({
      where: {
        userId: sessionUser.id,
        platform: "instagram",
      },
    });

    if (existingConnection) {
      // Update existing connection
      await prisma.socialConnection.update({
        where: { id: existingConnection.id },
        data: {
          isEnabled: true,
          isVerified: true,
          accessToken: longLivedToken,
          tokenType: "Bearer",
          tokenExpiry: tokenExpiry,
          platformUserId: instagramUserId,
          platformUsername: instagramUsername,
          accountType: accountType,
          lastFetch: new Date(),
        },
      });
    } else {
      // Create new connection
      await prisma.socialConnection.create({
        data: {
          userId: sessionUser.id,
          platform: "instagram",
          isEnabled: true,
          isVerified: true,
          accessToken: longLivedToken,
          tokenType: "Bearer",
          tokenExpiry: tokenExpiry,
          platformUserId: instagramUserId,
          platformUsername: instagramUsername,
          accountType: accountType,
          lastFetch: new Date(),
        },
      });
    }

    // Fetch Instagram profile and media data
    try {
      // Get extended profile data
      const profileResponse = await axios.get(`https://graph.instagram.com/me`, {
        params: {
          fields: "biography,followers_count,follows_count,media_count,name,profile_picture_url,username,website,account_type",
          access_token: longLivedToken,
        },
      });

      // Get media data
      const mediaResponse = await axios.get(`https://graph.instagram.com/me/media`, {
        params: {
          fields: "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,comments_count,like_count",
          access_token: longLivedToken,
        },
      });

      // Format data for response
      const formattedResponse = {
        profile: {
          id: instagramUserId,
          name: profileResponse.data?.name || "",
          username: profileResponse.data?.username || instagramUsername,
          account_type: profileResponse.data?.account_type || accountType,
          biography: profileResponse.data?.biography || "",
          followers_count: profileResponse.data?.followers_count || 0,
          follows_count: profileResponse.data?.follows_count || 0,
          media_count: profileResponse.data?.media_count || 0,
          profile_picture_url: profileResponse.data?.profile_picture_url || "",
          website: profileResponse.data?.website || null,
        },
        media: mediaResponse.data?.data || [],
      };

      return NextResponse.json({
        success: true,
        message: "Instagram account connected successfully",
        data: formattedResponse,
      });
    } catch (dataError) {
      console.error("Error fetching Instagram data:", dataError);
      
      // Return basic success even if data fetch fails
      return NextResponse.json({
        success: true,
        message: "Instagram account connected with limited data access",
        data: {
          profile: {
            id: instagramUserId,
            username: instagramUsername,
            account_type: accountType,
          },
          media: [],
        },
      });
    }
  } catch (error) {
    console.error(
      "Instagram authentication error:",
      error.response?.data || error.message
    );
    
    return NextResponse.json(
      { 
        success: false,
        message: error.response?.data?.error_message ||
          error.message ||
          "Authentication failed"
      },
      { status: error.response?.status || 500 }
    );
  }
}