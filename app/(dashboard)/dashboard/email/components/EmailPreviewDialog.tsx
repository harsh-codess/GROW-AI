"use client";

import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle2, XCircle, Code, Zap, Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: {
    email: string;
    status: string;
    subject: string | null;
    sentAt: Date | null;
    emailContent: string | null;
  };
}

export function EmailPreviewDialog({ isOpen, onClose, email }: EmailPreviewDialogProps) {
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();

  // Start the glow animation when component mounts
  useEffect(() => {
    const animateGlow = async () => {
      await glowControls.start({
        opacity: [0.3, 0.5, 0.3],
        transition: { duration: 3, ease: "easeInOut", repeat: Infinity }
      });
    };
    
    animateGlow();
  }, [glowControls]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
<DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-3xl w-[90vw] max-h-[90vh] p-0 border-[#323232] bg-[#1a1a1a] backdrop-blur-sm rounded-xl shadow-xl shadow-black/30">
        {/* Top illuminated border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
        
        {/* Close button */}
        <Button 
          className="absolute top-4 right-4 p-1 h-8 w-8 rounded-full bg-[#232323] hover:bg-[#323232] border-none text-gray-400 hover:text-white z-20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Animated glow spots */}
        <motion.div 
          ref={glowRef}
          animate={glowControls}
          className="absolute top-40 left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30 pointer-events-none"
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 text-gray-200 relative z-10 p-6"
        >
          <DialogHeader className="pb-4 border-b border-[#323232]">
            <DialogTitle className="text-xl font-bold break-words text-white flex items-center">
              <Code className="h-5 w-5 mr-2 text-[#bcee45] flex-shrink-0" />
              <span className="line-clamp-2">{email.subject || "No Subject"}</span>
            </DialogTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="border-[#323232] bg-[#232323]/50 hover:border-[#bcee45]/30 hover:shadow-[#bcee45]/5 transition-all">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#bcee45] flex-shrink-0" />
                      <span className="text-sm text-gray-400 truncate">{email.email}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="border-[#323232] bg-[#232323]/50 hover:border-[#bcee45]/30 hover:shadow-[#bcee45]/5 transition-all">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#bcee45] flex-shrink-0" />
                      <span className="text-sm text-gray-400">
                        {email.sentAt ? formatDistanceToNow(new Date(email.sentAt), { addSuffix: true }) : "Not sent yet"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="border-[#323232] bg-[#232323]/50 hover:border-[#bcee45]/30 hover:shadow-[#bcee45]/5 transition-all">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      {email.status === "sent" ? (
                        <div className="p-1 rounded-md bg-[#bcee45]/20 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-[#bcee45]" />
                        </div>
                      ) : (
                        <div className="p-1 rounded-md bg-[#ff5555]/20 flex-shrink-0">
                          <XCircle className="h-4 w-4 text-[#ff5555]" />
                        </div>
                      )}
                      <Badge className={
                        email.status === "sent" ? 'bg-[#bcee45]/20 text-[#bcee45] hover:bg-[#bcee45]/30' :
                        email.status === "failed" ? 'bg-[#ff5555]/20 text-[#ff5555] hover:bg-[#ff5555]/30' :
                        'bg-[#323232] text-gray-300'
                      }>
                        {email.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </DialogHeader>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex-grow"
          >
            <div className="border border-[#323232] rounded-lg bg-[#232323]/30 relative overflow-hidden group">
              {/* Edge glow effect */}
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <ScrollArea className="h-[calc(90vh-220px)] min-h-[300px] w-full p-4 relative">
                <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-[#232323] to-transparent pointer-events-none z-10"></div>
                <div className="absolute -bottom-4 left-0 right-0 h-8 bg-gradient-to-t from-[#232323] to-transparent pointer-events-none z-10"></div>
                
                {email.emailContent ? (
                  <div
                    className="text-gray-300 email-content px-2"
                    dangerouslySetInnerHTML={{ __html: email.emailContent }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4">
                    <div className="p-6 rounded-full bg-[#323232] mb-2">
                      <Terminal className="h-10 w-10 text-[#bcee45]" />
                    </div>
                    <p>No email content available</p>
                    <div className="mt-4 bg-[#323232]/80 rounded-lg border border-[#323232] relative overflow-hidden group px-8 py-4 hover:border-[#bcee45]/30 transition-all max-w-md">
                      {/* Edge glow effect */}
                      <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-start gap-3">
                        <Zap className="h-4 w-4 text-[#bcee45] mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-400">
                          Email content may be pending generation or failed to process
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        </motion.div>
        
        {/* CSS for email content styling */}
        <style jsx global>{`
          .email-content {
            color: #e5e7eb;
            font-family: Arial, sans-serif;
            line-height: 1.6;
          }
          
          .email-content h1, 
          .email-content h2, 
          .email-content h3, 
          .email-content h4 {
            color: #fff;
            margin-top: 1.5em;
            margin-bottom: 0.75em;
          }
          
          .email-content h1 {
            font-size: 1.5rem;
          }
          
          .email-content h2 {
            font-size: 1.25rem;
          }
          
          .email-content h3 {
            font-size: 1.1rem;
          }
          
          .email-content p {
            margin-bottom: 1em;
          }
          
          .email-content a {
            color: #bcee45;
            text-decoration: none;
          }
          
          .email-content a:hover {
            text-decoration: underline;
          }
          
          .email-content ul, 
          .email-content ol {
            padding-left: 1.5rem;
            margin-bottom: 1em;
          }
          
          .email-content li {
            margin-bottom: 0.5em;
          }
          
          .email-content blockquote {
            border-left: 3px solid #bcee45;
            padding-left: 1rem;
            margin-left: 0;
            margin-right: 0;
            color: #9ca3af;
          }
          
          /* Fix for common email styling issues */
          .email-content table {
            max-width: 100%;
            overflow-x: auto;
            display: block;
            color: #e5e7eb;
            margin-bottom: 1em;
            border-collapse: collapse;
          }
          
          .email-content table td,
          .email-content table th {
            border: 1px solid #323232;
            padding: 8px;
          }
          
          .email-content img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
          }
          
          .email-content hr {
            border: 0;
            border-top: 1px solid #323232;
            margin: 1.5em 0;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}