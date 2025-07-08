// actions/voice-agent/startCampaign.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { extractPhoneNumbers } from "@/app/lib/voice-agent/extractPhoneNumbers";
import { z } from "zod";
import twilio from "twilio";

// Define environment variables schema
const EnvironmentSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().min(1, "TWILIO_ACCOUNT_SID is required"),
  TWILIO_AUTH_TOKEN: z.string().min(1, "TWILIO_AUTH_TOKEN is required"),
  TWILIO_PHONE_NUMBER: z.string().min(1, "TWILIO_PHONE_NUMBER is required"),
  ULTRAVOX_API_KEY: z.string().min(1, "ULTRAVOX_API_KEY is required"),
  ULTRAVOX_API_URL: z.string().url("ULTRAVOX_API_URL must be a valid URL").optional(),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").optional()
});

export async function startCampaign(assistantId: string) {
  try {
    // Validate required environment variables
    const envVars = {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      ULTRAVOX_API_KEY: process.env.ULTRAVOX_API_KEY,
      ULTRAVOX_API_URL: process.env.ULTRAVOX_API_URL || "https://api.ultravox.ai/api/calls",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    };
    
    const envValidation = EnvironmentSchema.safeParse(envVars);
    if (!envValidation.success) {
      const missingVars = envValidation.error.errors.map(e => e.path[0]).join(", ");
      console.error(`Missing or invalid environment variables: ${missingVars}`);
      return { success: false, error: "Server configuration error. Please contact support." };
    }
    
    const session = await getSessionUser();
    
    if (!session?.id) {
      return { success: false, error: "Unauthorized access" };
    }
    
    // Use transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get assistant with knowledge base
      const assistant = await tx.assistant.findFirst({
        where: {
          id: assistantId,
          userId: session.id
        },
        include: {
          knowledgeBase: true
        }
      });
      
      if (!assistant) {
        throw new Error("Assistant not found or access denied");
      }
      
      // Extract phone numbers from knowledge base
      const phoneNumbers: string[] = [];
      
      for (const doc of assistant.knowledgeBase) {
        const numbers = extractPhoneNumbers(doc.content);
        console.log("Extracted numbers:", numbers);
        phoneNumbers.push(...numbers);
      }
      
      // Filter out duplicates
      const uniquePhoneNumbers = [...new Set(phoneNumbers)];
      
      if (uniquePhoneNumbers.length === 0) {
        throw new Error("No valid phone numbers found in the knowledge base");
      }

      // FIXED: First look up or create the phone number before creating the campaign
      // Check if there's a default phone number for this user
      let phoneNumber = await tx.phoneNumber.findFirst({
        where: { userId: session.id }
      });
      
      // If no phone number exists, create one with the default Twilio credentials
      if (!phoneNumber) {
        phoneNumber = await tx.phoneNumber.create({
          data: {
            name: "Default Twilio Number",
            number: process.env.TWILIO_PHONE_NUMBER!,
            sid: process.env.TWILIO_ACCOUNT_SID!,
            authToken: process.env.TWILIO_AUTH_TOKEN!,
            userId: session.id
          }
        });
      }
      
      // Create contact list for the campaign
      const contactList = await tx.contactList.create({
        data: {
          name: `${assistant.name} Contacts - ${new Date().toISOString().slice(0, 10)}`,
          description: `Auto-generated contacts for ${assistant.name} campaign`,
          userId: session.id,
          contacts: {
            create: uniquePhoneNumbers.map(phoneNumber => ({
              phoneNumber,
              name: null
            }))
          }
        }
      });
      
      // Create a campaign with the valid phone number ID
      const campaign = await tx.campaign.create({
        data: {
          name: `${assistant.name} Campaign - ${new Date().toISOString().slice(0, 10)}`,
          description: `Auto-generated campaign for ${assistant.name}`,
          assistantId: assistant.id,
          numberId: phoneNumber.id, // Now we have a valid phoneNumber.id
          userId: session.id,
          contactListId: contactList.id,
          status: "PENDING", // Start as pending, will be set to RUNNING when processed
          totalContacts: uniquePhoneNumbers.length,
          startTime: "09:00", // Default to standard business hours
          endTime: "17:00"
        }
      });
      
      // Log campaign creation
      await tx.campaignLog.create({
        data: {
          campaignId: campaign.id,
          message: `Campaign created with ${uniquePhoneNumbers.length} contacts`,
          level: "INFO"
        }
      });
      
      return {
        campaignId: campaign.id,
        totalContacts: uniquePhoneNumbers.length
      };
    });
    
    // Start the campaign in background
    void processCampaign(result.campaignId);
    
    revalidatePath("/dashboard/voice-agent");
    
    return { 
      success: true, 
      data: { 
        campaignId: result.campaignId,
        totalContacts: result.totalContacts
      } 
    };
  } catch (error) {
    console.error("Error starting campaign:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to start campaign" 
    };
  }
}

// Helper function to log campaign events
async function logCampaignEvent(campaignId: string, message: string, level: string = "INFO") {
  try {
    await prisma.campaignLog.create({
      data: {
        campaignId,
        message,
        level
      }
    });
  } catch (error) {
    console.error("Failed to log campaign event:", error);
  }
}


async function processCampaign(campaignId: string) {
  const ULTRAVOX_API_URL = process.env.ULTRAVOX_API_URL || "https://api.ultravox.ai/api/calls";
  
  try {
    // Fetch campaign data with related entities
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        voiceAssistant: {
          include: {
            knowledgeBase: true
          }
        },
        contactList: {
          include: {
            contacts: {
              orderBy: { createdAt: 'asc' }
            }
          }
        },
        number: true
      }
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Update campaign to running
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "RUNNING", startDate: new Date() }
    });

    // Setup Twilio client - use the campaign's phone number details or fall back to env vars
    const twilioSid = campaign.number?.sid || process.env.TWILIO_ACCOUNT_SID!;
    const twilioToken = campaign.number?.authToken || process.env.TWILIO_AUTH_TOKEN!;
    const phoneNumber = campaign.number?.number || process.env.TWILIO_PHONE_NUMBER!;
    
    const twilioClient = twilio(twilioSid, twilioToken);

    // Initialize counters
    let successfulCalls = 0;
    let failedCalls = 0;

    // Helper function to create Ultravox call - extracted for retry capability
    const createUltravoxCall = async (assistant: any, retryCount = 0): Promise<any> => {
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // ms
      
      try {
        // Prepare system prompt with knowledge base content
        const content = assistant.knowledgeBase.map((item: any) => item.content).join("\n");
        const systemPrompt = assistant.systemPrompt + 
          "\nThe knowledge base is as follows:\n" + 
          content + 
          `\nYou must respond in ${assistant.language}.`;
        
        // API configuration
        const config = {
          systemPrompt: systemPrompt,
          model: assistant.model,
          voice: assistant.voice,
          temperature: assistant.temprature,
          firstSpeaker: assistant.speakFirst === 'AGENT' ? "FIRST_SPEAKER_AGENT" : "FIRST_SPEAKER_USER",
          medium: { "twilio": {} }
        };
        
        // Make API request with proper error handling
        const response = await fetch(ULTRAVOX_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.ULTRAVOX_API_KEY || ""
          },
          body: JSON.stringify(config)
        });

        console.log("hello",response)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Ultravox API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }
        
        return await response.json();
      } catch (error) {
        // Implement retry logic
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return createUltravoxCall(assistant, retryCount + 1);
        }
        throw error;
      }
    };

    // Process contacts with proper rate limiting
    for (const contact of campaign.contactList.contacts) {
      try {
        // Check if campaign is still running (allow for pausing)
        const currentStatus = await prisma.campaign.findUnique({
          where: { id: campaignId },
          select: { status: true },
        });

        if (currentStatus?.status !== "RUNNING") {
          await logCampaignEvent(
            campaignId, 
            `Campaign ${currentStatus?.status.toLowerCase()} - stopping execution`
          );
          break;
        }
        
        await logCampaignEvent(campaignId, `Attempting to call ${contact.phoneNumber}`);
        
        // Create Ultravox call
        const ultravoxResponse = await createUltravoxCall(campaign.voiceAssistant);
        
        if (!ultravoxResponse.joinUrl) {
          await logCampaignEvent(
            campaignId, 
            `Failed to get join URL for ${contact.phoneNumber}`, 
            "ERROR"
          );
          failedCalls++;
          continue;
        }

        // Make the call using Twilio
        const call = await twilioClient.calls.create({
          twiml: `<Response><Connect><Stream url="${ultravoxResponse.joinUrl}"/></Connect></Response>`,
          to: contact.phoneNumber,
          from: phoneNumber,
          statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status-callback`,
          statusCallbackEvent: ['completed', 'failed', 'no-answer'],
          statusCallbackMethod: 'POST'
        });

        const callSid = call.sid;
        
        // Create call history record
        const callHistory = await prisma.callHistory.create({
          data: {
            assistantName: campaign.voiceAssistant.name,
            campaignName: campaign.name,
            customerName: contact.name || "",
            customerNumber: contact.phoneNumber,
            callStartedAt: new Date(),
            callSid: callSid,
            ultravoxCallId: ultravoxResponse.callId || null,
            callAnswered: false,
            transcript: JSON.stringify([]),
            userId: campaign.userId
          }
        });

        // Wait for call to complete with improved error handling
        let callStatus = null;
        let callCompleted = false;
        let retryCount = 0;
        const maxRetries = 5;
        
        while (!callCompleted && retryCount < maxRetries) {
          try {
            // Check every 5 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            callStatus = await twilioClient.calls(callSid).fetch();
            
            if (['completed', 'failed', 'no-answer', 'canceled', 'busy'].includes(callStatus.status)) {
              callCompleted = true;
            }
          } catch (fetchError) {
            retryCount++;
            console.error(`Error fetching call status (attempt ${retryCount}/${maxRetries}):`, fetchError);
            
            if (retryCount >= maxRetries) {
              callCompleted = true;
              await logCampaignEvent(
                campaignId, 
                `Failed to fetch call status for ${contact.phoneNumber}`, 
                "ERROR"
              );
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // Try to get transcript with retry logic
        try {
          if (ultravoxResponse.callId) {
            let transcriptResponse = null;
            let transcriptRetries = 0;
            const maxTranscriptRetries = 3;
            
            while (!transcriptResponse && transcriptRetries < maxTranscriptRetries) {
              try {
                const response = await fetch(
                  `${ULTRAVOX_API_URL}/${ultravoxResponse.callId}/messages`,
                  {
                    method: 'GET',
                    headers: {
                      'X-API-Key': process.env.ULTRAVOX_API_KEY || "",
                      'Accept': 'application/json'
                    }
                  }
                );
                
                if (response.ok) {
                  transcriptResponse = await response.json();
                } else {
                  transcriptRetries++;
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }
              } catch (error) {
                transcriptRetries++;
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
            
            if (transcriptResponse) {
              // Extract messages and format as conversation
              const messages = transcriptResponse.results
                .filter((msg: any) => msg.text && msg.text.trim())
                .map((msg: any) => ({
                  role: msg.role === 'MESSAGE_ROLE_AGENT' ? 'assistant' : 'user',
                  text: msg.text.trim(),
                  timestamp: msg.callStageMessageIndex
                }))
                .sort((a: any, b: any) => a.timestamp - b.timestamp);
              
              // Generate a simple summary
              let summary = "No conversation detected";
              if (messages.length > 0) {
                const assistantMessages = messages.filter(m => m.role === 'assistant');
                const customerMessages = messages.filter(m => m.role === 'user');
                
                summary = `Call included ${assistantMessages.length} assistant messages and ${customerMessages.length} customer responses.`;
              }
              
              // Update call history with transcript and metadata
              await prisma.callHistory.update({
                where: { id: callHistory.id },
                data: {
                  transcript: JSON.stringify(messages),
                  callEndedAt: new Date(),
                  callAnswered: callStatus?.status === 'completed',
                  callDuration: parseInt(callStatus?.duration || '0'),
                  callSummary: summary
                }
              });
            }
          }
        } catch (transcriptError) {
          console.error("Error fetching transcript:", transcriptError);
          await logCampaignEvent(
            campaignId, 
            `Failed to fetch transcript for call to ${contact.phoneNumber}`, 
            "ERROR"
          );
        }

        // Update counters based on call result
        if (callStatus && callStatus.status === 'completed') {
          successfulCalls++;
          await logCampaignEvent(
            campaignId, 
            `Call completed successfully to ${contact.phoneNumber}`, 
            "INFO"
          );
        } else {
          failedCalls++;
          await logCampaignEvent(
            campaignId, 
            `Call failed to ${contact.phoneNumber}: ${callStatus ? callStatus.status : 'Unknown status'}`, 
            "ERROR"
          );
        }

        // Update campaign with current progress
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            completedContacts: successfulCalls,
            failedContacts: failedCalls,
            lastCallDate: new Date()
          }
        });

        // Rate limiting - wait between calls
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        console.error(`Error calling ${contact.phoneNumber}:`, error);
        failedCalls++;
        await logCampaignEvent(
          campaignId, 
          `Failed to call ${contact.phoneNumber}: ${error instanceof Error ? error.message : String(error)}`, 
          "ERROR"
        );
      }
    }

    // Update campaign with final stats
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "COMPLETED",
        endDate: new Date(),
        completedContacts: successfulCalls,
        failedContacts: failedCalls
      },
    });

    await logCampaignEvent(
      campaignId, 
      `Campaign completed. Success: ${successfulCalls}, Failed: ${failedCalls}`,
      "INFO"
    );
    
    // REMOVED: revalidatePath("/dashboard/voice-agent"); - This was causing the error

  } catch (error) {
    console.error("Campaign processing error:", error);
    
    try {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: "FAILED",
          endDate: new Date(),
        },
      });
      
      await logCampaignEvent(
        campaignId, 
        `Campaign failed: ${error instanceof Error ? error.message : String(error)}`, 
        "ERROR"
      );
    } catch (updateError) {
      console.error("Error updating campaign status:", updateError);
    }
    
  }
}