// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'weekly';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'yearly') {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    // Get content count
    const contentCount = await prisma.contentItem.count({
      where: {
        companyId: sessionUser.companyId,
        createdAt: {
          gte: startDate
        }
      }
    });
    
    // Get chat conversations count
    const chatCount = await prisma.chatMessage.count({
      where: {
        conversation: {
          companyId: sessionUser.companyId
        },
        role: "user",
        createdAt: {
          gte: startDate
        }
      }
    });
    
    // Get generated images count
    const imageCount = await prisma.productImage.count({
      where: {
        companyId: sessionUser.companyId,
        createdAt: {
          gte: startDate
        }
      }
    });
    
    // Calculate previous period stats for trend calculation
    let previousStartDate = new Date(startDate);
    let previousEndDate = new Date(startDate);
    
    if (timeRange === 'weekly') {
      previousStartDate.setDate(previousStartDate.getDate() - 7);
    } else if (timeRange === 'monthly') {
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);
    } else if (timeRange === 'yearly') {
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
    }
    
    // Get previous period content count
    const prevContentCount = await prisma.contentItem.count({
      where: {
        companyId: sessionUser.companyId,
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    });
    
    // Get previous period chat count
    const prevChatCount = await prisma.chatMessage.count({
      where: {
        conversation: {
          companyId: sessionUser.companyId
        },
        role: "user",
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    });
    
    // Get previous period image count
    const prevImageCount = await prisma.productImage.count({
      where: {
        companyId: sessionUser.companyId,
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    });
    
    // Calculate trends (percent change)
    const contentTrend = prevContentCount > 0 
      ? Math.round(((contentCount - prevContentCount) / prevContentCount) * 100) 
      : 0;
    
    const chatTrend = prevChatCount > 0 
      ? Math.round(((chatCount - prevChatCount) / prevChatCount) * 100) 
      : 0;
    
    const imageTrend = prevImageCount > 0 
      ? Math.round(((imageCount - prevImageCount) / prevImageCount) * 100) 
      : 0;
    
    // Calculate marketing score (simple weighted algorithm)
    const totalActivity = contentCount + chatCount + imageCount;
    const maxPossibleScore = 100;
    let marketingScore = Math.min(
      Math.round((totalActivity / 10) * maxPossibleScore / 10),
      maxPossibleScore
    );
    
    // If no activity, set a base score
    if (totalActivity === 0) {
      marketingScore = 0;
    }
    
    // Calculate previous marketing score
    const prevTotalActivity = prevContentCount + prevChatCount + prevImageCount;
    let prevMarketingScore = Math.min(
      Math.round((prevTotalActivity / 10) * maxPossibleScore / 10),
      maxPossibleScore
    );
    
    // If no previous activity, set a base score
    if (prevTotalActivity === 0) {
      prevMarketingScore = 0;
    }
    
    const marketingScoreTrend = prevMarketingScore > 0 
      ? Math.round(((marketingScore - prevMarketingScore) / prevMarketingScore) * 100) 
      : 0;
    
    return NextResponse.json({
      stats: [
        {
          title: "Content Created",
          value: contentCount.toString(),
          trend: contentTrend,
        },
        {
          title: "AI Conversations",
          value: chatCount.toString(),
          trend: chatTrend,
        },
        {
          title: "Images Generated",
          value: imageCount.toString(),
          trend: imageTrend,
        },
        {
          title: "Marketing Score",
          value: marketingScore.toString(),
          trend: marketingScoreTrend,
        },
      ]
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "An error occurred fetching dashboard stats" },
      { status: 500 }
    );
  }
}