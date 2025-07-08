// actions/voice-agent/uploadKnowledgeBase.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { extractTextFromPDF, extractTextFromDOCX, extractTextFromCSV } from "@/app/lib/document-extractors";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "application/csv"
];

export async function uploadKnowledgeBase(files: File[], assistantId: string) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return { success: false, error: "Unauthorized access" };
    }

    // Check if assistant exists and belongs to user
    const assistant = await prisma.assistant.findFirst({
      where: {
        id: assistantId,
        userId: session.id
      }
    });

    if (!assistant) {
      return { success: false, error: "Assistant not found or access denied" };
    }

    // Process files with individual error handling
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            return {
              file: file.name,
              success: false,
              error: `File ${file.name} exceeds maximum size of 10MB`
            };
          }

          // Validate file type
          const fileType = file.type;
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          
          if (!SUPPORTED_MIME_TYPES.includes(fileType) && 
              !(fileExtension === 'csv' && fileType === 'application/octet-stream')) {
            return {
              file: file.name,
              success: false,
              error: `Unsupported file type: ${fileType}`
            };
          }

          // Extract content based on file type
          let content = "";
          if (fileType === "application/pdf" || fileExtension === 'pdf') {
            content = await extractTextFromPDF(file);
          } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                    fileExtension === 'docx') {
            content = await extractTextFromDOCX(file);
          } else if (fileType === "text/csv" || fileType === "application/csv" || 
                    fileExtension === 'csv') {
            content = await extractTextFromCSV(file);
          }

          // Validate extracted content
          if (!content.trim()) {
            return {
              file: file.name,
              success: false,
              error: `No text content could be extracted from ${file.name}`
            };
          }

          // Create knowledge base entry
          const entry = await prisma.knowledgeBase.create({
            data: {
              name: file.name,
              content,
              assistantId
            }
          });

          return {
            file: file.name,
            success: true,
            data: entry
          };
        } catch (error) {
          return {
            file: file.name,
            success: false,
            error: error instanceof Error ? error.message : `Failed to process ${file.name}`
          };
        }
      })
    );

    // Calculate overall success
    const successfulEntries = results.filter(result => result.success);
    const failedEntries = results.filter(result => !result.success);

    // If all failed, return error
    if (successfulEntries.length === 0) {
      return { 
        success: false, 
        error: "All files failed to process", 
        details: failedEntries 
      };
    }

    // Return partial success if some failed
    return { 
      success: true, 
      data: successfulEntries.map(entry => entry.data), 
      partialFailure: failedEntries.length > 0,
      failedFiles: failedEntries
    };
  } catch (error) {
    console.error("Error uploading knowledge base:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload knowledge base"
    };
  }
}