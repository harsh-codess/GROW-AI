'use server';

import { getSessionUser } from "@/lib/auth/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import fetch from 'node-fetch';
import https from 'https';
import { Memory, SearchResponse } from "@/types/memory";
import { prisma } from "@/lib/prisma";
import { getEmbeddings } from "../lib/embeddings";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

// Create a custom agent that ignores SSL certificate errors
const agent = new https.Agent({
  rejectUnauthorized: false
});

type ApiResponse = {
  success: boolean;
  error?: string;
  data?: any;
};

type ChatResponse = {
  success: boolean;
  error?: string;
  answer?: string;
  context?: Memory[];
};

type QdrantPoint = {
  id: string;
  version: number;
  score: number;
  payload: {
    content: string;
    type: string;
    metadata: Record<string, any>;
    createdAt: string;
  };
};

type QdrantSearchResponse = {
  result: QdrantPoint[];
};

export async function addMemory(type: 'url' | 'pdf' | 'document' | 'text', content: string, metadata?: any): Promise<ApiResponse> {
  try {
    const user = await getSessionUser();
    if (!user?.companyId) {
      return { success: false, error: 'No company ID found' };
    }

    // Get the company's vector store ID
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { vectorStoreId: true }
    });

    if (!company?.vectorStoreId) {
      return { success: false, error: 'No vector store found for company' };
    }

    // Get embeddings for the content
    const embeddings = await getEmbeddings(content);

    // Add to Qdrant
    const response = await fetch(`${process.env.QDRANT_URL}/collections/${company.vectorStoreId}/points`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.QDRANT_API_KEY || '',
      },
      body: JSON.stringify({
        points: [{
          id: crypto.randomUUID(),
          vector: embeddings,
          payload: {
            content,
            type,
            metadata: {
              ...metadata,
              companyId: user.companyId,
            },
            createdAt: new Date().toISOString(),
          }
        }]
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Failed to add memory: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding memory:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add memory' };
  }
}

export async function searchMemories(query: string): Promise<SearchResponse> {
  try {
    const user = await getSessionUser();
    if (!user?.companyId) {
      throw new Error('No company ID found');
    }

    // Get the company's vector store ID
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { vectorStoreId: true }
    });

    if (!company?.vectorStoreId) {
      console.warn('No vector store found for company, returning empty results');
      return { results: [], total: 0, timing: 0 };
    }

    // Get embeddings for the query
    const embeddings = await getEmbeddings(query);
    
    // Search in Qdrant
    const response = await fetch(`${process.env.QDRANT_URL}/collections/${company.vectorStoreId}/points/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.QDRANT_API_KEY || '',
      },
      body: JSON.stringify({
        vector: embeddings,
        limit: 5,
        with_payload: true,
        with_vectors: false,
      }),
    });

    if (!response.ok) {
      console.warn(`Failed to search vectors: ${response.status}, returning empty results`);
      return { results: [], total: 0, timing: 0 };
    }

    const searchResults = await response.json() as QdrantSearchResponse;
    
    // Convert Qdrant results to our memory format
    const results = searchResults.result.map((result: any) => ({
      documentId: result.id,
      title: result.payload.type || 'Document',
      chunks: [{
        content: result.payload.content,
        isRelevant: true,
        score: result.score
      }],
      createdAt: result.payload.createdAt,
      score: result.score,
      metadata: result.payload.metadata,
      updatedAt: new Date().toISOString()
    }));

    return {
      results,
      total: results.length,
      timing: 0
    };
  } catch (error) {
    console.error("Error searching memories:", error);
    return { results: [], total: 0, timing: 0 };
  }
}

export async function chatWithMemories(message: string): Promise<ChatResponse> {
  try {
    const memories = await searchMemories(message);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Prepare the context from memories
    const context = memories.results
      .flatMap(memory => memory.chunks
        .filter(chunk => chunk.isRelevant)
        .map(chunk => chunk.content)
      )
      .join('\n\n');

    // Create the prompt
    const prompt = `You are a helpful AI assistant. Use the following context to answer the question. If the context doesn't contain relevant information, say so.

Context:
${context}

Question: ${message}

Answer in a helpful, professional tone. Use markdown formatting when appropriate.`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    return {
      success: true,
      answer,
      context: memories.results
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate response"
    };
  }
} 