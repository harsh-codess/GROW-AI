// actions/voice-agent/createAssistant.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define validation schema
const AssistantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
  voice: z.string(),
  language: z.string(),
  model: z.string(),
  speakFirst: z.enum(["AGENT", "CLIENT"]),
  temprature: z.number().min(0).max(1),
  maxCallDuration: z.number().min(30).max(600),
});

export type CreateAssistantParams = z.infer<typeof AssistantSchema>;

export async function createAssistant(params: CreateAssistantParams) {
  try {
    // Validate input
    const validationResult = AssistantSchema.safeParse(params);
    if (!validationResult.success) {
      return { 
        success: false, 
        error: "Invalid input: " + validationResult.error.errors.map(e => e.message).join(", ") 
      };
    }

    const session = await getSessionUser();
    if (!session?.id) {
      return { success: false, error: "Unauthorized access" };
    }

    // Use a transaction to ensure data consistency
    const assistant = await prisma.$transaction(async (tx) => {
      return await tx.assistant.create({
        data: {
          name: params.name,
          systemPrompt: params.systemPrompt,
          voice: params.voice,
          language: params.language,
          model: params.model,
          speakFirst: params.speakFirst,
          temprature: params.temprature,
          maxCallDuration: params.maxCallDuration,
          userId: session.id
        }
      });
    });

    revalidatePath("/dashboard/voice-agent");
    
    return {
      success: true,
      data: assistant
    };
  } catch (error) {
    console.error("Error creating assistant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create assistant"
    };
  }
}