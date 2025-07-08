// app/(dashboard)/dashboard/chat/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { addMemory, searchMemories, chatWithMemories } from '@/app/actions/memory';
import { Link2, FileText, Upload, MessageSquare, Plus, Send, Loader2, X, ChevronDown, ChevronUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Memory, Message } from "@/types/memory";
import { Skeleton } from '@/components/ui/skeleton';
import { prisma } from '@/lib/prisma';

type MemoryContext = {
  chunks: Array<{
    content: string;
    isRelevant: boolean;
    score: number;
  }>;
  metadata: {
    companyId: string;
  };
  createdAt: string;
};

type ProcessingJob = {
  id: string;
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  error?: string;
};

const ChatSkeleton = () => (
  <div className="flex justify-start">
    <div className="max-w-[80%] bg-muted rounded-lg p-4 space-y-2">
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[300px]" />
      <Skeleton className="h-4 w-[250px]" />
    </div>
  </div>
);

const ProcessingStatus = ({ status, error }: { status: ProcessingJob['status'], error?: string }) => {
  switch (status) {
    case 'queued':
      return (
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-xs">Queued</span>
        </div>
      );
    case 'processing':
      return (
        <div className="flex items-center text-primary">
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          <span className="text-xs">Processing</span>
        </div>
      );
    case 'completed':
      return (
        <div className="flex items-center text-green-500">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span className="text-xs">Completed</span>
        </div>
      );
    case 'failed':
      return (
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">Failed</span>
        </div>
      );
  }
};

export default function ChatPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [input, setInput] = useState('');
  const [showMemories, setShowMemories] = useState(true);
  const [addingMemory, setAddingMemory] = useState(false);
  const [newMemoryType, setNewMemoryType] = useState<'url' | 'pdf' | 'document' | 'text'>('url');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);

  useEffect(() => {
    loadMemories();
    loadProcessingJobs();
    // Poll for processing jobs every 5 seconds
    const interval = setInterval(loadProcessingJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadProcessingJobs = async () => {
    try {
      const response = await fetch('/api/documents/processing');
      if (response.ok) {
        const jobs = await response.json();
        setProcessingJobs(jobs);
      }
    } catch (error) {
      console.error('Error loading processing jobs:', error);
    }
  };

  const loadMemories = async () => {
    try {
      setMemoryLoading(true);
      const result = await searchMemories(input);
      setMemories(result.results);
    } catch (error) {
      console.error('Error loading memories:', error);
      setMemories([]);
    } finally {
      setMemoryLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        context: data.sources,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setNewMemoryContent(file.name);
    }
  }, []);

  const handleAddMemory = async () => {
    if ((!newMemoryContent.trim() && !selectedFile) || !newMemoryType) return;

    setMemoryLoading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (newMemoryType === 'text') {
        const blob = new Blob([newMemoryContent], { type: 'text/plain' });
        formData.append('file', blob, 'text.txt');
      } else if (newMemoryType === 'url') {
        const blob = new Blob([newMemoryContent], { type: 'text/plain' });
        formData.append('file', blob, 'url.txt');
      }
      formData.append('type', newMemoryType);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add memory');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "Document added to processing queue"
      });
      await loadProcessingJobs();
      setAddingMemory(false);
      setNewMemoryContent('');
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add memory",
        variant: "destructive"
      });
    } finally {
      setMemoryLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Company Knowledge Base</h1>
          <p className="text-muted-foreground">Chat with your company's knowledge</p>
        </div>
        <Button
          onClick={() => setShowMemories(!showMemories)}
          variant="ghost"
          className="text-muted-foreground"
        >
          {showMemories ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          Knowledge Base
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {showMemories && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '350px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r bg-muted/30 flex flex-col"
            >
              <div className="p-4 flex-shrink-0">
                <Button
                  onClick={() => setAddingMemory(true)}
                  className="w-full mb-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Knowledge
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {processingJobs.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Processing Documents</h3>
                    <div className="space-y-2">
                      {processingJobs.map(job => (
                        <Card key={job.id} className="cursor-pointer hover:bg-accent transition-colors">
                          <CardContent className="p-4 flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{job.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                Added {new Date(job.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <ProcessingStatus status={job.status} error={job.error} />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {memoryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : memories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No knowledge base items found</p>
                    <p className="text-sm mt-2">Add some knowledge to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memories.map(memory => (
                      <Card key={memory.documentId} className="cursor-pointer hover:bg-accent transition-colors">
                        <CardContent className="p-4 flex items-start space-x-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{memory.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(memory.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-4`}>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.context && message.context.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                      {message.context.map((ctx, i) => {
                        const firstChunk = ctx.chunks?.[0];
                        const content = firstChunk?.content || 'No content available';
                        return (
                          <p key={i} className="text-xs text-muted-foreground truncate">
                            • {content.substring(0, 100)}...
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isGenerating && <ChatSkeleton />}
            <div ref={chatEndRef} />
          </div>

          <div className="sticky bottom-0 p-4 border-t bg-background">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask anything about your company..."
                disabled={loading || isGenerating}
              />
              <Button onClick={handleSendMessage} disabled={loading || isGenerating}>
                {loading || isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {addingMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Add Knowledge</h2>
                <Button variant="ghost" size="icon" onClick={() => setAddingMemory(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="url" onValueChange={(v) => setNewMemoryType(v as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                  <TabsTrigger value="document">Document</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                </TabsList>
                <TabsContent value="url">
                  <Input
                    placeholder="Enter website URL"
                    value={newMemoryContent}
                    onChange={e => setNewMemoryContent(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="pdf">
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    {selectedFile && newMemoryType === 'pdf' ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setNewMemoryContent('');
                          }}
                        >
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="document">
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".doc,.docx,.txt,.md"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    {selectedFile && newMemoryType === 'document' ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setNewMemoryContent('');
                          }}
                        >
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          DOC, DOCX, TXT, MD up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="text">
                  <textarea
                    className="w-full h-32 p-2 border rounded-lg resize-none"
                    placeholder="Enter text content..."
                    value={newMemoryContent}
                    onChange={e => setNewMemoryContent(e.target.value)}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAddingMemory(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMemory} disabled={memoryLoading}>
                  {memoryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Knowledge'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}