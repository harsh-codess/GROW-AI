"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs";
import { getSessionUser } from "@/lib/auth/auth";
import type { Campaign, Lead } from "@/lib/generated/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const resend = new Resend(process.env.RESEND_API_KEY!);

interface GenerateEmailsParams {
  csvData: {
    headers: string[];
    data: Record<string, string>[];
    totalRows: number;
  };
  tone: string;
  emailType: string;
  context: string;
  template: string;
}

interface CampaignWithLeads extends Campaign {
  leads: Lead[];
}

export async function generateAndSendEmails({
  csvData,
  tone,
  emailType,
  context,
  template
}: GenerateEmailsParams) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    // Create campaign in database
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: `Campaign ${new Date().toISOString()}`,
        tone,
        emailType,
        context,
        status: "sending",
        userId: session.id,
        leads: {
          create: csvData.data.map(row => ({
            email: row.email,
            name: row.name,
            data: row, // Store all CSV data as JSON
            status: "pending"
          }))
        }
      },
      include: {
        leads: true
      }
    });

    try {
      if (emailType === "generic") {
        await GenericMail(context, tone, campaign, template); // Added await here
      } else {
        await CustomMail(context, tone, campaign, template); // Added await here
      }

      // Update campaign status to completed
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: {
          status: "completed"
        }
      });

    } catch (error) {
      console.error("Error in email processing:", error);
      // Update campaign status to failed
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: {
          status: "failed"
        }
      });
      throw error;
    }
  } catch (error) {
    console.error("Campaign creation failed:", error);
    throw error;
  }
}

const CustomMail = async (
  context: string,
  tone: string,
  campaign: CampaignWithLeads,
  template: string
) => {
  try {
    const emailPromises = campaign.leads.map(async (lead) => {
      try {
        // Generate subject based on context
        const subjectPrompt = `Generate a single, clean email subject line for a business email.
        Rules:
        1. Return ONLY the subject line, no explanations or options
        2. Keep it under 50 characters
        3. Make it professional and relevant to the context
        4. No markdown formatting or special characters
        5. No bullet points or lists

        Context: ${context}`;

        const subjectResult = await model.generateContent(subjectPrompt);
        const subject = subjectResult.response.text()
          .trim()
          .replace(/\n/g, ' ')  // Replace newlines with spaces
          .replace(/\s+/g, ' '); // Replace multiple spaces with single space

        const emailPrompt = `You are an expert email copywriter.
        Based on the following context and template, write a professional, personalized email that is ready to send.

        Important Rules:
        1. Use the provided HTML template structure
        2. Replace placeholders like [Recipient Name], [Company Name], etc. with actual values
        3. Keep the styling and layout of the template
        4. Personalize the content based on the recipient's details
        5. Make sure the email is complete and ready to send

        Template:
        ${template}

        Context:
        ${context}

        Recipient details:
        ${JSON.stringify(lead.data)}

        Write a personalized email in a ${tone} tone using the provided template and context.
        The email should be addressed to ${lead.name || lead.email} and include their specific details from the context.`;

        const result = await model.generateContent(emailPrompt);
        const personalizedContent = result.response.text();

        // Validate email format
        if (!lead.email || !lead.email.includes('@')) {
          console.warn(`Invalid email format for lead ${lead.id}: ${lead.email}`);
          await prisma.emailLead.update({
            where: { id: lead.id },
            data: {
              status: "failed",
              data: {
                ...(lead.data as Record<string, any>),
                error: "Invalid email format"
              }
            }
          });
          return false;
        }

        // Store the generated email content and subject
        await prisma.emailLead.update({
          where: { id: lead.id },
          data: {
            emailContent: personalizedContent,
            subject: subject
          }
        });

        // Send email
        const { data, error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "flowAi@harshdeep.tech",
          to: lead.email,
          subject: subject,
          html: personalizedContent,
          replyTo: process.env.RESEND_REPLY_TO_EMAIL,
        });

        if (error) {
          throw new Error(`Resend API error: ${error.message}`);
        }

        if (!data) {
          throw new Error("No response data from Resend API");
        }

        // Update lead status
        await prisma.emailLead.update({
          where: { id: lead.id },
          data: {
            status: "sent",
            sentAt: new Date(),
            data: {
              ...(lead.data as Record<string, any>),
              messageId: data.id
            }
          }
        });
        return true;
      } catch (error) {
        console.error(`Failed to send email to ${lead.email}:`, error);
        await prisma.emailLead.update({
          where: { id: lead.id },
          data: {
            status: "failed",
            data: {
              ...(lead.data as Record<string, any>),
              error: error instanceof Error ? error.message : "Failed to send email"
            }
          }
        });
        return false;
      }
    });

    const results = await Promise.all(emailPromises);
    const successfulLeads = results.filter(Boolean).length;
    const failedLeads = results.length - successfulLeads;

    // Update campaign with basic statistics
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: failedLeads === campaign.leads.length ? "failed" :
               successfulLeads === campaign.leads.length ? "completed" : "partial",
        totalEmails: { set: campaign.leads.length },
        successful: { set: successfulLeads },
        failed: { set: failedLeads }
      }
    });
  } catch (error) {
    console.error("Campaign failed:", error);
    // If campaign generation fails, mark all leads as failed
    await prisma.emailLead.updateMany({
      where: { campaignId: campaign.id },
      data: {
        status: "failed",
        data: {
          error: "Campaign generation failed"
        }
      }
    });

    // Update campaign status to failed
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: "failed",
        totalEmails: { set: campaign.leads.length },
        successful: { set: 0 },
        failed: { set: campaign.leads.length }
      }
    });
    throw error; // Re-throw the error to be caught by the calling function
  }
};

const GenericMail = async (
  context: string,
  tone: string,
  campaign: CampaignWithLeads,
  template: string
) => {
  try {
    // Generate subject based on context
    const subjectPrompt = `Generate a single, clean email subject line for a business email.
    Rules:
    1. Return ONLY the subject line, no explanations or options
    2. Keep it under 50 characters
    3. Make it professional and relevant to the context
    4. No markdown formatting or special characters
    5. No bullet points or lists

    Context: ${context}`;

    const subjectResult = await model.generateContent(subjectPrompt);
    const subject = subjectResult.response.text()
      .trim()
      .replace(/\n/g, ' ')  // Replace newlines with spaces
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space

    const emailPrompt = `You are an expert email copywriter. Generate a professional email in a ${tone} tone.
    Use the provided HTML template structure and replace placeholders with appropriate content.
    The email should be engaging and focused on building a business relationship.

    Template:
    ${template}

    Context:
    ${context}`;

    const result = await model.generateContent(emailPrompt);
    const emailContent = result.response.text();

    // Process emails in batches with rate limiting
    const batchSize = 2;
    const batches = [];

    for (let i = 0; i < campaign.leads.length; i += batchSize) {
      batches.push(campaign.leads.slice(i, i + batchSize));
    }

    let failedLeads = 0;
    let successfulLeads = 0;

    for (const batch of batches) {
      const batchPromises = batch.map(async (lead) => {
        try {
          // Validate email format
          if (!lead.email || !lead.email.includes('@')) {
            console.warn(`Invalid email format for lead ${lead.id}: ${lead.email}`);
            await prisma.emailLead.update({
              where: { id: lead.id },
              data: {
                status: "failed",
                data: {
                  ...(lead.data as Record<string, any>),
                  error: "Invalid email format"
                }
              }
            });
            failedLeads++;
            return false;
          }

          // Store the generated email content and subject
          await prisma.emailLead.update({
            where: { id: lead.id },
            data: {
              emailContent: emailContent,
              subject: subject
            }
          });

          // Send email
          const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@harsdeep",
            to: lead.email,
            subject: subject,
            html: emailContent,
            replyTo: process.env.RESEND_REPLY_TO_EMAIL,
          });

          if (error) {
            throw new Error(`Resend API error: ${error.message}`);
          }

          if (!data) {
            throw new Error("No response data from Resend API");
          }

          // Update lead status
          await prisma.emailLead.update({
            where: { id: lead.id },
            data: {
              status: "sent",
              sentAt: new Date(),
              data: {
                ...(lead.data as Record<string, any>),
                messageId: data.id
              }
            }
          });
          successfulLeads++;
          return true;
        } catch (error) {
          console.error(`Failed to send email to ${lead.email}:`, error);
          await prisma.emailLead.update({
            where: { id: lead.id },
            data: {
              status: "failed",
              data: {
                ...(lead.data as Record<string, any>),
                error: error instanceof Error ? error.message : "Failed to send email"
              }
            }
          });
          failedLeads++;
          return false;
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Add delay between batches to respect rate limit
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    // Update campaign with basic statistics
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: failedLeads === campaign.leads.length ? "failed" :
               successfulLeads === campaign.leads.length ? "completed" : "partial",
        totalEmails: { set: campaign.leads.length },
        successful: { set: successfulLeads },
        failed: { set: failedLeads }
      }
    });
  } catch (error) {
    console.error("Campaign failed:", error);
    // If campaign generation fails, mark all leads as failed
    await prisma.emailLead.updateMany({
      where: { campaignId: campaign.id },
      data: {
        status: "failed",
        data: {
          error: "Campaign generation failed"
        }
      }
    });

    // Update campaign status to failed
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: "failed",
        totalEmails: { set: campaign.leads.length },
        successful: { set: 0 },
        failed: { set: campaign.leads.length }
      }
    });
    throw error; // Re-throw the error to be caught by the calling function
  }
};
