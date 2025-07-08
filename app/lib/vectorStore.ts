import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "embedding-001",
  apiKey: GEMINI_API_KEY,
});

export async function getVectorStore(collectionName: string) {
  try {
    return await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      collectionName,
    });
  } catch (error) {
    console.error('Error getting vector store:', error);
    throw error;
  }
}

export async function createVectorStore(collectionName: string) {
  try {
    return await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      collectionName,
      collectionConfig: {
        vectors: {
          size: 768, // Gemini embedding size
          distance: "Cosine",
        },
      },
    });
  } catch (error) {
    console.error('Error creating vector store:', error);
    throw error;
  }
}

export async function addDocumentsToStore(
  collectionName: string,
  documents: Document[],
  metadata: Record<string, any>
) {
  try {
    let vectorStore = await getVectorStore(collectionName).catch(async () => {
      // If collection doesn't exist, create it
      return await createVectorStore(collectionName);
    });

    await vectorStore.addDocuments(documents, metadata);
  } catch (error) {
    console.error('Error adding documents to store:', error);
    throw error;
  }
}

export async function searchDocuments(
  collectionName: string,
  query: string,
  k: number = 4
) {
  try {
    const vectorStore = await getVectorStore(collectionName);
    return await vectorStore.similaritySearch(query, k);
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}