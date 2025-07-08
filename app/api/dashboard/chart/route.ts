// app/api/dashboard/chart/route.ts
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
    
    // Get time range and metric from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'weekly';
    const metric = searchParams.get('metric') || 'views';
    
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
    
    // Fetch analytics events
    const events = await prisma.analyticsEvent.findMany({
      where: {
        companyId: sessionUser.companyId,
        createdAt: {
          gte: startDate
        },
        eventType: metric
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Format data based on time range
    let formattedData = [];
    
    if (timeRange === 'weekly') {
      // Group by day of week
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      formattedData = days.map(day => {
        const dayEvents = events.filter(event => {
          const dayOfWeek = event.createdAt.getDay();
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
          return dayName === day;
        });
        
        return {
          name: day,
          views: dayEvents.filter(e => e.eventType === 'views').length,
          engagement: dayEvents.filter(e => e.eventType === 'engagement').length,
          conversion: dayEvents.filter(e => e.eventType === 'conversion').length,
        };
      });
    } else if (timeRange === 'monthly') {
      // Group by week
      formattedData = Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + (i * 7));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        const weekEvents = events.filter(event => {
          return event.createdAt >= weekStart && event.createdAt < weekEnd;
        });
        
        return {
          name: `Week ${i + 1}`,
          views: weekEvents.filter(e => e.eventType === 'views').length,
          engagement: weekEvents.filter(e => e.eventType === 'engagement').length,
          conversion: weekEvents.filter(e => e.eventType === 'conversion').length,
        };
      });
    } else if (timeRange === 'yearly') {
      // Group by month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      formattedData = months.map(month => {
        const monthIndex = months.indexOf(month);
        const monthEvents = events.filter(event => event.createdAt.getMonth() === monthIndex);
        
        return {
          name: month,
          views: monthEvents.filter(e => e.eventType === 'views').length,
          engagement: monthEvents.filter(e => e.eventType === 'engagement').length,
          conversion: monthEvents.filter(e => e.eventType === 'conversion').length,
        };
      });
    }
    
    return NextResponse.json({ chartData: formattedData });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { message: "An error occurred fetching chart data" },
      { status: 500 }
    );
  }
}