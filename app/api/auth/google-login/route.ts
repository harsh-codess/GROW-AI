import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    const { email, name, provider } = await request.json();

    if (provider !== "google") {
      return NextResponse.json(
        { message: "Invalid authentication provider" },
        { status: 400 }
      );
    }

    // Find existing user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found. Please register first.",
          redirectTo: "/auth/register"
        },
        { status: 404 }
      );
    }

    // Return user data for session creation
    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Google login:", error);
    return NextResponse.json(
      { message: "An error occurred during Google login" },
      { status: 500 }
    );
  }
}
