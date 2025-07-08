"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";

interface Lead {
  id: string;
  email: string;
  status: string;
  sentAt: Date | null;
  emailContent: string | null;
  subject: string | null;
  error?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalEmails: number;
  successful: number;
  failed: number;
  createdAt: Date;
  context: string;
  tone: string;
  emailType: string;
  leads: Lead[];
}

interface Analytics {
  totalCampaigns: number;
  totalEmailsSent: number;
  totalEmailsFailed: number;
  averageOpenRate: number;
  campaigns: Campaign[];
}

export async function getCampaignAnalytics(): Promise<Analytics> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const campaigns = await prisma.emailCampaign.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        leads: {
          select: {
            id: true,
            email: true,
            status: true,
            sentAt: true,
            emailContent: true,
            subject: true,
            data: true,
          },
        },
      },
    });

    // Calculate analytics metrics
    const totalCampaigns = campaigns.length;
    const totalEmailsSent = campaigns.reduce((sum, campaign) => sum + campaign.successful, 0);
    const totalEmailsFailed = campaigns.reduce((sum, campaign) => sum + campaign.failed, 0);
    const averageOpenRate = totalCampaigns > 0 ? (totalEmailsSent / (totalEmailsSent + totalEmailsFailed)) * 100 : 0;

    return {
      totalCampaigns,
      totalEmailsSent,
      totalEmailsFailed,
      averageOpenRate,
      campaigns,
    };
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    throw error;
  }
}
