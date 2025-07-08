import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import axios from "axios";
import { prisma } from "@/lib/prisma";

// GET - Generate LinkedIn auth URL
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // LinkedIn OAuth requires a randomly generated state parameter for security
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store the state in a cookie or database to validate on callback
    // For this implementation, we'll pass the user ID in the state parameter
    // In a production app, you'd want to use a more secure approach
    const encodedState = Buffer.from(JSON.stringify({
      userId: sessionUser.id,
      nonce: state
    })).toString('base64');

    // LinkedIn OAuth 2.0 authorization URL
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    
    // Add required parameters
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', process.env.LINKEDIN_CLIENT_ID || '');
    authUrl.searchParams.append('redirect_uri', process.env.LINKEDIN_REDIRECT_URI || '');
    authUrl.searchParams.append('state', encodedState);
    authUrl.searchParams.append('scope', 'openid email profile w_member_social');

    return NextResponse.json({ url: authUrl.toString() });
  } catch (error) {
    console.error("Error generating LinkedIn auth URL:", error);
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

    const { code, state } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Validate the state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      if (stateData.userId !== sessionUser.id) {
        throw new Error("Invalid state parameter");
      }
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid state parameter" },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!tokenResponse.data || !tokenResponse.data.access_token) {
      return NextResponse.json(
        { message: "Failed to obtain access token from LinkedIn" },
        { status: 500 }
      );
    }

    const accessToken = tokenResponse.data.access_token;
    const expiresIn = tokenResponse.data.expires_in;
    
    // Calculate token expiry time
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expiresIn);

    // Get user profile
    console.log("accesstoken",accessToken);
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    const linkedInUserId = profileResponse.data.id;
    let linkedInUsername = '';

    // Get user's name
    if (profileResponse.data.localizedFirstName && profileResponse.data.localizedLastName) {
      linkedInUsername = `${profileResponse.data.localizedFirstName} ${profileResponse.data.localizedLastName}`;
    }

    // Get email address
    let emailResponse;
    try {
      emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
    } catch (error) {
      console.error("Error fetching LinkedIn email:", error);
      // Continue without email
    }

    let email = null;
    if (emailResponse?.data?.elements && emailResponse.data.elements.length > 0) {
      email = emailResponse.data.elements[0]['handle~']?.emailAddress || null;
    }

    // Store in database - first check if connection already exists
    const existingConnection = await prisma.socialConnection.findFirst({
      where: {
        userId: sessionUser.id,
        platform: "linkedin",
      },
    });

    if (existingConnection) {
      // Update existing connection
      await prisma.socialConnection.update({
        where: { id: existingConnection.id },
        data: {
          isEnabled: true,
          isVerified: true,
          accessToken: accessToken,
          tokenExpiry: tokenExpiry,
          platformUserId: linkedInUserId,
          platformUsername: linkedInUsername,
          lastFetch: new Date(),
        },
      });
    } else {
      // Create new connection
      await prisma.socialConnection.create({
        data: {
          userId: sessionUser.id,
          platform: "linkedin",
          isEnabled: true,
          isVerified: true,
          accessToken: accessToken,
          tokenExpiry: tokenExpiry,
          platformUserId: linkedInUserId,
          platformUsername: linkedInUsername,
          lastFetch: new Date(),
        },
      });
    }

    // Return basic profile info
    return NextResponse.json({
      message: "LinkedIn account connected successfully",
      data: {
        id: linkedInUserId,
        name: linkedInUsername,
        email: email
      }
    });
  } catch (error) {
    console.error("Error connecting LinkedIn account:", error);
    return NextResponse.json(
      { message: "An error occurred while connecting your LinkedIn account" },
      { status: 500 }
    );
  }
}