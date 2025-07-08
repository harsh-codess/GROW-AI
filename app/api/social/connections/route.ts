import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// GET - Get all social connections for current user
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all social connections for this user
    const connections = await prisma.socialConnection.findMany({
      where: {
        userId: sessionUser.id,
      },
      select: {
        id: true,
        platform: true,
        platformUsername: true,
        isEnabled: true,
        isVerified: true,
        accountType: true,
        lastFetch: true,
      },
    });

    // Format the data into an object by platform for easy access
    const formattedConnections = {
      youtube: {
        isConnected: false,
        username: null,
        lastFetch: null,
      },
      instagram: {
        isConnected: false,
        username: null,
        lastFetch: null,
      },
      linkedin: {
        isConnected: false,
        username: null,
        lastFetch: null,
      },
    };

    // Update the formatted data with actual connections
    connections.forEach((connection) => {
      if (connection.platform in formattedConnections && connection.isEnabled) {
        formattedConnections[connection.platform as keyof typeof formattedConnections] = {
          isConnected: true,
          username: connection.platformUsername,
          lastFetch: connection.lastFetch,
        };
      }
    });

    return NextResponse.json({
      message: "Social connections fetched successfully",
      data: formattedConnections,
    });
  } catch (error) {
    console.error("Error fetching social connections:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching social connections" },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect a specific social platform
export async function DELETE(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the platform from the request body
    const { platform } = await request.json();
    if (!platform) {
      return NextResponse.json(
        { message: "Platform is required" },
        { status: 400 }
      );
    }

    // Find the connection
    const connection = await prisma.socialConnection.findFirst({
      where: {
        userId: sessionUser.id,
        platform: platform,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { message: `No ${platform} connection found` },
        { status: 404 }
      );
    }

    // Disable the connection
    await prisma.socialConnection.update({
      where: { id: connection.id },
      data: {
        isEnabled: false,
        accessToken: null,
      },
    });

    // Clear cached data
    await prisma.analyticsData.deleteMany({
      where: {
        userId: sessionUser.id,
        platform: platform,
      },
    });

    return NextResponse.json({
      message: `${platform} account disconnected successfully`,
    });
  } catch (error) {
    console.error("Error disconnecting social platform:", error);
    return NextResponse.json(
      { message: "An error occurred while disconnecting the social platform" },
      { status: 500 }
    );
  }
}