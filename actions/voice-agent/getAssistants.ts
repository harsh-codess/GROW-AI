// actions/voice-agent/getAssistants.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export async function getAssistants() {
  try {
    const session = await getSessionUser();
    
    if (!session?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    const assistants = await prisma.assistant.findMany({
      where: {
        userId: session.id
      },
      include: {
        knowledgeBase: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return { success: true, data: assistants };
  } catch (error) {
    console.error("Error fetching assistants:", error);
    return { success: false, error: "Failed to fetch assistants" };
  }
}