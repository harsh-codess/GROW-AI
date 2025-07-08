// app/api/user/profile/route.ts
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
    
    const user = await prisma.user.findUnique({
      where: {
        id: sessionUser.id
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    // Don't send the password
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "An error occurred fetching user profile" },
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
    
    // For form data with file upload
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const avatarFile = formData.get('avatar') as File | null;
    
    let avatarUrl = null;
    
    if (avatarFile) {
      // Handle file upload logic here, e.g.:
      // 1. Upload to cloud storage (e.g., S3, Cloudinary)
      // 2. Get the URL to store in the database
      
      // Example with a placeholder:
      avatarUrl = `/uploads/avatars/${Date.now()}-${avatarFile.name}`;
      
      // In a real implementation, you would:
      // const uploadResponse = await uploadToCloudinary(avatarFile);
      // avatarUrl = uploadResponse.secure_url;
    }
    
    const updatedUser = await prisma.user.update({
      where: {
        id: sessionUser.id
      },
      data: {
        name,
        bio,
        ...(avatarUrl && { image: avatarUrl }),
      }
    });
    
    // Don't send the password
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: "An error occurred updating user profile" },
      { status: 500 }
    );
  }
}