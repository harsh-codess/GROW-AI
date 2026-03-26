import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchDocuments } from '@/app/lib/vectorStore';
import { prisma } from "@/lib/prisma";
import { getSessionUser } from '@/lib/auth/auth';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


if (!GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const userId = session?.id;
    const companyId = session?.companyId;

    if (!userId || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create a default conversation for the user
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        userId,
        companyId,
        title: 'Default Conversation'
      }
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          title: 'Default Conversation',
          userId,
          companyId
        }
      });
    }

    // Search for relevant documents
    const collectionName = `company_${companyId}`;
    const relevantDocs = await searchDocuments(collectionName, message);

    // Create context from relevant documents
    const context = relevantDocs
      .map((doc) => doc.pageContent)
      .join('\n\n');

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

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

    // Store the messages in the database
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: 'user',
        content: message,
      },
    });

    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: 'assistant',
        content: answer,
      },
    });

    return NextResponse.json({
      answer,
      sources: relevantDocs.map((doc) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      })),
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 