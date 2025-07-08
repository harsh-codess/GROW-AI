// app/api/dashboard/recommendations/route.ts
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
    
    // Get the company's content and activity data
    const company = await prisma.company.findUnique({
      where: {
        id: sessionUser.companyId
      },
      include: {
        contentItems: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }
    
    // Get counts of different content types
    const contentCounts = await prisma.contentItem.groupBy({
      by: ['type'],
      where: {
        companyId: sessionUser.companyId
      },
      _count: {
        id: true
      }
    });
    
    // Map to a more usable format
    const contentTypeMap = contentCounts.reduce((acc, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    // Generate recommendations based on content gaps and patterns
    const recommendations = [];
    
    // Check for product images
    const imageCount = await prisma.productImage.count({
      where: {
        companyId: sessionUser.companyId
      }
    });
    
    if (imageCount < 5) {
      recommendations.push({
        title: "Optimize your product images",
        description: "Increase CTR by 15% with professional AI photoshoots",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-100",
        priority: 1
      });
    }
    
    // Check for blog content
    if (!contentTypeMap['blog'] || contentTypeMap['blog'] < 3) {
      recommendations.push({
        title: "Create a blog post series",
        description: "Top industry trends for Q2 2025",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-100",
        priority: 2
      });
    }
    
    // Check for email campaigns
    if (!contentTypeMap['email'] || contentTypeMap['email'] < 2) {
      recommendations.push({
        title: "Set up email automation",
        description: "Nurture leads with personalized follow-ups",
        bgColor: "bg-green-50",
        borderColor: "border-green-100",
        priority: 3
      });
    }
    
    // Add more recommendations
    recommendations.push({
      title: "Analyze your target audience",
      description: "Identify new segments for growth",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      priority: 4
    });
    
    recommendations.push({
      title: "Optimize social media strategy",
      description: "Best times to post for your industry",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      priority: 5
    });
    
    // Sort by priority and take top 3
    const topRecommendations = recommendations
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3);
    
    return NextResponse.json({ recommendations: topRecommendations });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { message: "An error occurred generating recommendations" },
      { status: 500 }
    );
  }
}