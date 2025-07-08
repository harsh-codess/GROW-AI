// lib/auth/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-for-dev-only");

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  companyId?: string | null;
}

export async function signJwtToken(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token expires in 7 days
    .sign(JWT_SECRET);

  return token;
}

export async function verifyJwtToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { user: SessionUser };
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  // Create JWT token
  const token = await signJwtToken(user);
  
  // Store session in database
  await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  
  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set({
    name: "session",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });
}

export async function clearSessionCookie() {
  // Clear cookie
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  
  const verifiedToken = await verifyJwtToken(sessionCookie.value);
  
  if (!verifiedToken) {
    return null;
  }
  
  // Verify session exists in database and get up-to-date user data
  try {
    const session = await prisma.session.findFirst({
      where: {
        userId: verifiedToken.user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
    
    if (!session) {
      return null;
    }
  
    // Return the user with UPDATED data from the database
    // This ensures we get the current companyId, even if it was updated
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      companyId: session.user.companyId, // Use the current companyId from the database
    };
  } catch (error) {
    console.error("Error getting session user:", error);
    return null;
  }
}

export async function refreshSessionCookie(req: NextRequest) {
  const sessionCookie = req.cookies.get("session");
  
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  
  const verifiedToken = await verifyJwtToken(sessionCookie.value);
  
  if (!verifiedToken) {
    return null;
  }
  
  // Get expiration from token
  const { exp } = verifiedToken as any;
  const expirationTime = exp * 1000; // Convert to milliseconds
  
  // Check if token is about to expire (less than 1 day remaining)
  const oneDayInMs = 24 * 60 * 60 * 1000;
  if (expirationTime - Date.now() < oneDayInMs) {
    try {
      // Get the current user data from the database
      const user = await prisma.user.findUnique({
        where: { id: verifiedToken.user.id },
      });
      
      if (!user) {
        return null;
      }
      
      // Create a new token with the updated user data
      const sessionUser: SessionUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      };
      
      // Create new token
      const newToken = await signJwtToken(sessionUser);
      
      // Update session in database
      await prisma.session.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
      
      // Set new cookie in response
      const response = NextResponse.next();
      response.cookies.set({
        name: "session",
        value: newToken,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });
      
      return response;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}