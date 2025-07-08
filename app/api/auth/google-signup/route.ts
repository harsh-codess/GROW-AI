import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth/auth";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { email, name, provider } = await request.json();

    if (provider !== "google") {
      return NextResponse.json(
        { message: "Invalid authentication provider" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists. Please login instead." },
        { status: 400 }
      );
    }

    // Generate a random password for the user
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
      },
    });

    // Set session cookie
    await setSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    });

    return NextResponse.json(
      {
        user,
        redirectTo: "/onboarding"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in Google signup:", error);
    return NextResponse.json(
      { message: "An error occurred during Google signup" },
      { status: 500 }
    );
  }
}
