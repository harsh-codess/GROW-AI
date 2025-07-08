// app/api/dashboard/content-distribution/route.ts
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
    
    // Get content type filter from query params
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType') || 'all';
    
    // Prepare the where clause based on content type
    const whereClause = {
      companyId: sessionUser.companyId,
      ...(contentType !== 'all' ? { type: contentType } : {})
    };
    
    // Count content items by type
    const contentItems = await prisma.contentItem.findMany({
      where: whereClause,
      select: {
        type: true,
        platform: true
      }
    });
    
    // Group by type and count
    const typeGroups = contentItems.reduce((acc, item) => {
      // Determine the category based on type and platform
      let category = item.type;
      
      if (item.type === 'social' && item.platform) {
        category = item.platform;
      }
      
      if (!acc[category]) {
        acc[category] = 0;
      }
      
      acc[category]++;
      return acc;
    }, {} as Record<string, number>);
    
    // Format data for chart
    const distributionData = Object.entries(typeGroups).map(([name, value]) => {
      let color;
      switch (name) {
        case 'blog':
          color = '#8b5cf6'; // Purple
          break;
        case 'social':
        case 'instagram':
        case 'twitter':
        case 'linkedin':
        case 'facebook':
          color = '#3b82f6'; // Blue
          break;
        case 'email':
          color = '#10b981'; // Green
          break;
        case 'landing':
          color = '#f59e0b'; // Amber
          break;
        default:
          color = '#6b7280'; // Gray
      }
      
      // Convert platform codes to readable names
      let displayName = name;
      if (name === 'instagram' || name === 'twitter' || name === 'linkedin' || name === 'facebook') {
        displayName = name.charAt(0).toUpperCase() + name.slice(1);
      } else if (name === 'blog') {
        displayName = 'Blog Posts';
      } else if (name === 'email') {
        displayName = 'Email Campaigns';
      } else if (name === 'landing') {
        displayName = 'Landing Pages';
      }
      
      return {
        name: displayName,
        value,
        color
      };
    });
    
    return NextResponse.json({ distributionData });
  } catch (error) {
    console.error("Error fetching content distribution:", error);
    return NextResponse.json(
      { message: "An error occurred fetching content distribution" },
      { status: 500 }
    );
  }
}