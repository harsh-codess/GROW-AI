
// app/api/user/notifications/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // In a real app, you'd have a NotificationPreferences model
    // For now, we'll return placeholder data
    const notifications = {
      emailNotifications: true,
      marketingEmails: false,
      activityDigest: true,
      newFeatures: true,
    };
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { message: "An error occurred fetching notification settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // In a real app, you'd update the notification preferences in the database
    // For demo purposes, we'll just return the updated preferences
    
    return NextResponse.json({ 
      notifications: data,
      message: "Notification preferences updated successfully" 
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { message: "An error occurred updating notification settings" },
      { status: 500 }
    );
  }
}
