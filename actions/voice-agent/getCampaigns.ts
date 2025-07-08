
// actions/voice-agent/getCampaigns.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export async function getCampaigns() {
  try {
    const session = await getSessionUser();
    
    if (!session?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: session.id
      },
      include: {
        voiceAssistant: {
          select: {
            name: true,
            voice: true
          }
        },
        logs: {
          take: 5,
          orderBy: {
            timestamp: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return { success: true, data: campaigns };
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return { success: false, error: "Failed to fetch campaigns" };
  }
}
