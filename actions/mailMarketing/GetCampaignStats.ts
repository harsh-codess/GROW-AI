"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export async function getActiveCampaigns() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  return await prisma.emailCampaign.count({
    where: {
      userId: user.id,
      status: "sending"
    }
  });
}

export async function getTotalEmailsSent() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  return await prisma.lead.count({
    where: {
      campaign: {
        userId: user.id
      },
      status: "sent"
    }
  });
}

export async function getRecentCampaigns() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  return await prisma.emailCampaign.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 3,
    include: {
      leads: {
        select: {
          status: true
        }
      }
    }
  });
}
