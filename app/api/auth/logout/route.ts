// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (sessionUser) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: {
          userId: sessionUser.id,
        },
      });
    }
    
    // Clear session cookie
    await clearSessionCookie();
    
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json(
      { message: "An error occurred while logging out" },
      { status: 500 }
    );
  }
}