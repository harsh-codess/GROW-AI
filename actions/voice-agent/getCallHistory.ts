
// actions/voice-agent/getCallHistory.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export async function getCallHistory() {
  try {
    const session = await getSessionUser();
    
    if (!session?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    const calls = await prisma.callHistory.findMany({
      where: {
        userId: session.id
      },
      orderBy: {
        callStartedAt: "desc"
      }
    });
    
    return { success: true, data: calls };
  } catch (error) {
    console.error("Error fetching call history:", error);
    return { success: false, error: "Failed to fetch call history" };
  }
}
