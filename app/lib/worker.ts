import { Worker } from 'bullmq';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { prisma } from "@/lib/prisma";
import { addDocumentsToStore } from "./vectorStore";

const worker = new Worker(
  'document-processing',
  async (job) => {
    const { documentId, filePath, fileType, companyId, userId, jobId } = job.data;

    console.log(`[Document Processing] Starting job ${jobId} for document ${documentId}`);
    console.log(`[Document Processing] File: ${filePath}, Type: ${fileType}`);

    try {
      // First verify the job exists
      const existingJob = await prisma.documentProcessingJob.findUnique({
        where: { id: jobId }
      });

      if (!existingJob) {
        console.error(`[Document Processing] Job ${jobId} not found`);
        throw new Error(`Job ${jobId} not found`);
      }

      console.log(`[Document Processing] Updating job ${jobId} status to processing`);
      // Update job status to processing
      await prisma.documentProcessingJob.update({
        where: { id: jobId },
        data: { status: 'processing' },
      });

      // Load document based on file type
      console.log(`[Document Processing] Loading document ${filePath}`);
      let loader;
      switch (fileType.toLowerCase()) {
        case 'pdf':
          loader = new PDFLoader(filePath);
          break;
        case 'docx':
          loader = new DocxLoader(filePath);
          break;
        case 'txt':
          loader = new TextLoader(filePath);
          break;
        default:
          console.error(`[Document Processing] Unsupported file type: ${fileType}`);
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      const docs = await loader.load();
      console.log(`[Document Processing] Loaded ${docs.length} pages from document`);
      
      // Split documents into chunks
      console.log(`[Document Processing] Splitting document into chunks`);
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const chunks = await textSplitter.splitDocuments(docs);
      console.log(`[Document Processing] Split document into ${chunks.length} chunks`);

      // Create collection name based on company ID
      const collectionName = `company_${companyId}`;
      console.log(`[Document Processing] Adding chunks to vector store ${collectionName}`);

      // Add documents to vector store
      await addDocumentsToStore(collectionName, chunks, {
        documentId,
        companyId,
        userId,
      });

      console.log(`[Document Processing] Updating document and job status`);
      // Update document status and store chunks in database
      await prisma.$transaction([
        prisma.document.update({
          where: { id: documentId },
          data: {
            status: 'indexed',
            vectorStoreId: collectionName,
          },
        }),
        prisma.documentProcessingJob.update({
          where: { id: jobId },
          data: { status: 'completed' },
        }),
        ...chunks.map((chunk, index) =>
          prisma.documentChunk.create({
            data: {
              documentId,
              content: chunk.pageContent,
              metadata: chunk.metadata,
            },
          })
        ),
      ]);

      console.log(`[Document Processing] Job ${jobId} completed successfully`);

    } catch (error) {
      console.error(`[Document Processing] Error processing document:`, error);
      
      // Update job status to failed if job exists
      try {
        await prisma.documentProcessingJob.update({
          where: { id: jobId },
          data: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
        console.error(`[Document Processing] Updated job ${jobId} status to failed`);
      } catch (updateError) {
        console.error(`[Document Processing] Failed to update job status:`, updateError);
      }
      
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
); 