// app/api/dashboard/top-content/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    console.log("Session user:", sessionUser);
    
    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Fetch top performing content based on engagement metrics
    const topContent = await prisma.contentItem.findMany({
      where: {
        companyId: sessionUser.companyId,
      },
      orderBy: [
        // We would normally order by engagement metrics
        // For now, use createdAt as a fallback
        { createdAt: 'desc' }
      ],
      take: 4, // Top 4 items
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Format the content items
    const formattedContent = topContent.map(item => {
      let icon, iconBg;
      
      // Set icon based on content type
      if (item.type === 'blog') {
        icon = 'FileText';
        iconBg = 'bg-purple-50';
      } else if (item.type === 'social') {
        icon = 'MessageSquare';
        iconBg = 'bg-blue-50';
      } else if (item.type === 'email') {
        icon = 'Mail';
        iconBg = 'bg-green-50';
      } else {
        icon = 'FileText';
        iconBg = 'bg-amber-50';
      }
      
      // Calculate days ago
      const daysAgo = Math.floor((Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      let dateText;
      
      if (daysAgo === 0) {
        dateText = 'Today';
      } else if (daysAgo === 1) {
        dateText = 'Yesterday';
      } else if (daysAgo < 7) {
        dateText = `${daysAgo} days ago`;
      } else if (daysAgo < 30) {
        dateText = `${Math.floor(daysAgo / 7)} weeks ago`;
      } else {
        dateText = `${Math.floor(daysAgo / 30)} months ago`;
      }
      
      // Simulate engagement metrics (in a real app, these would come from analytics)
      const comments = Math.floor(Math.random() * 30) + 5;
      const engagement = ((Math.random() * 5) + 5).toFixed(1);
      
      return {
        id: item.id,
        title: item.title,
        date: dateText,
        comments,
        engagement,
        icon,
        iconBg,
        type: item.type,
        author: item.user?.name || 'Unknown'
      };
    });
    
    return NextResponse.json({ topContent: formattedContent });
  } catch (error) {
    console.error("Error fetching top content:", error);
    return NextResponse.json(
      { message: "An error occurred fetching top content" },
      { status: 500 }
    );
  }
}