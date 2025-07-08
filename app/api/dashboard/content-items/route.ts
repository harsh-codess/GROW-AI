// app/api/dashboard/content-items/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch all content items for the user
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get content items for the company
    const contentItems = await prisma.contentItem.findMany({
      where: {
        companyId: sessionUser.companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ contentItems });
  } catch (error) {
    console.error("Error fetching content items:", error);
    return NextResponse.json(
      { message: "An error occurred fetching content items" },
      { status: 500 }
    );
  }
}

// POST - Create a new content item
export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type, title, content, imageUrl, metadata } = await request.json();

    // Create content item
    const contentItem = await prisma.contentItem.create({
      data: {
        companyId: sessionUser.companyId,
        createdBy: sessionUser.id,
        type,
        title: title || `${type} content - ${new Date().toLocaleDateString()}`,
        content,
        imageUrl,
        rawContent: metadata ? JSON.stringify(metadata) : null,
        status: "draft", // Default status
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: sessionUser.id,
        companyId: sessionUser.companyId,
        activityType: "content_created",
        description: `Created ${type} content: ${title || 'Untitled'}`,
        metadata: { contentId: contentItem.id },
      },
    });

    return NextResponse.json({
      message: "Content created successfully",
      contentItem,
    });
  } catch (error) {
    console.error("Error creating content item:", error);
    return NextResponse.json(
      { message: "An error occurred creating the content item" },
      { status: 500 }
    );
  }
}