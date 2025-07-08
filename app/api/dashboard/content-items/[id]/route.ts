// app/api/dashboard/content-items/[id]/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch a specific content item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const contentItem = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!contentItem) {
      return NextResponse.json(
        { message: "Content item not found" },
        { status: 404 }
      );
    }

    // Check if the content item belongs to the user's company
    if (contentItem.companyId !== sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({ contentItem });
  } catch (error) {
    console.error("Error fetching content item:", error);
    return NextResponse.json(
      { message: "An error occurred fetching the content item" },
      { status: 500 }
    );
  }
}

// PATCH - Update a content item
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the content item to update
    const contentItem = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!contentItem) {
      return NextResponse.json(
        { message: "Content item not found" },
        { status: 404 }
      );
    }

    // Check if the content item belongs to the user's company
    if (contentItem.companyId !== sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, content, status, imageUrl, metadata } = await request.json();

    // Update content item
    const updatedContentItem = await prisma.contentItem.update({
      where: {
        id: params.id,
      },
      data: {
        title: title !== undefined ? title : contentItem.title,
        content: content !== undefined ? content : contentItem.content,
        status: status !== undefined ? status : contentItem.status,
        imageUrl: imageUrl !== undefined ? imageUrl : contentItem.imageUrl,
        rawContent: metadata ? JSON.stringify(metadata) : contentItem.rawContent,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: sessionUser.id,
        companyId: sessionUser.companyId,
        activityType: "content_updated",
        description: `Updated ${contentItem.type} content: ${title || contentItem.title}`,
        metadata: { contentId: contentItem.id },
      },
    });

    return NextResponse.json({
      message: "Content updated successfully",
      contentItem: updatedContentItem,
    });
  } catch (error) {
    console.error("Error updating content item:", error);
    return NextResponse.json(
      { message: "An error occurred updating the content item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a content item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the content item to delete
    const contentItem = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!contentItem) {
      return NextResponse.json(
        { message: "Content item not found" },
        { status: 404 }
      );
    }

    // Check if the content item belongs to the user's company
    if (contentItem.companyId !== sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete content item
    await prisma.contentItem.delete({
      where: {
        id: params.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: sessionUser.id,
        companyId: sessionUser.companyId,
        activityType: "content_deleted",
        description: `Deleted ${contentItem.type} content: ${contentItem.title}`,
        metadata: { contentType: contentItem.type },
      },
    });

    return NextResponse.json({
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content item:", error);
    return NextResponse.json(
      { message: "An error occurred deleting the content item" },
      { status: 500 }
    );
  }
}