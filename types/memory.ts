export type Memory = {
  documentId: string;
  title: string;
  chunks: Array<{
    content: string;
    isRelevant: boolean;
    score: number;
  }>;
  createdAt: string;
  score?: number;
  metadata?: Record<string, any>;
  updatedAt?: string;
};

export type SearchResponse = {
  results: Memory[];
  total: number;
  timing: number;
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  context?: Memory[];
}; 