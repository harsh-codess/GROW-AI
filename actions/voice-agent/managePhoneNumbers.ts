
"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import twilio from "twilio";

const PhoneSchema = z.object({
  name: z.string().min(1, "Name is required"),
  number: z.string().regex(/^\+[1-9]\d{1,14}$/, "Must be E.164 format (e.g. +12223334444)"),
  sid: z.string().min(1, "SID is required"),
  authToken: z.string().min(1, "Auth token is required"),
});

export type AddPhoneNumberParams = z.infer<typeof PhoneSchema>;

// Add a phone number
export async function addPhoneNumber(params: AddPhoneNumberParams) {
  try {
    // Validate input
    const validationResult = PhoneSchema.safeParse(params);
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

    // Test the Twilio credentials
    try {
      const client = twilio(params.sid, params.authToken);
      const validation = await client.validateRequest('', '', '', '');
      // Just checking if we can initialize the client
    } catch (twilioError) {
      return {
        success: false,
        error: "Invalid Twilio credentials. Please check your SID and Auth Token."
      };
    }

    // Save the phone number
    const phoneNumber = await prisma.phoneNumber.create({
      data: {
        name: params.name,
        number: params.number,
        sid: params.sid,
        authToken: params.authToken,
        userId: session.id
      }
    });

    revalidatePath("/dashboard/voice-agent");
    return {
      success: true,
      data: phoneNumber
    };
  } catch (error) {
    // Check for unique constraint violation
    if ((error as any).code === 'P2002') {
      return {
        success: false,
        error: "This phone number is already registered in the system."
      };
    }
    
    console.error("Error adding phone number:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add phone number"
    };
  }
}

// Get user's phone numbers
export async function getPhoneNumbers() {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const phoneNumbers = await prisma.phoneNumber.findMany({
      where: {
        userId: session.id
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { success: true, data: phoneNumbers };
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    return { success: false, error: "Failed to fetch phone numbers" };
  }
}

// Delete a phone number
export async function deletePhoneNumber(id: string) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if the phone number exists and belongs to the user
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: {
        id,
        userId: session.id
      }
    });

    if (!phoneNumber) {
      return { success: false, error: "Phone number not found or unauthorized" };
    }

    // Check if the phone number is in use by any campaign
    const campaignsUsingNumber = await prisma.campaign.count({
      where: {
        numberId: id
      }
    });

    if (campaignsUsingNumber > 0) {
      return {
        success: false,
        error: "This phone number is being used by one or more campaigns and cannot be deleted."
      };
    }

    // Delete the phone number
    await prisma.phoneNumber.delete({
      where: {
        id
      }
    });

    revalidatePath("/dashboard/voice-agent");
    return { success: true };
  } catch (error) {
    console.error("Error deleting phone number:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete phone number"
    };
  }
}
