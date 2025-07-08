"use client";

import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useAnimation } from "framer-motion";
import { Mail, AlertCircle, CheckCircle2, Clock, FileText, Terminal, Code, BrainCircuit, Zap, X, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CampaignDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    name: string;
    status: string;
    totalEmails: number;
    successful: number;
    failed: number;
    createdAt: Date;
    context: string;
    tone: string;
    emailType: string;
    leads: Array<{
      id: string;
      email: string;
      status: string;
      sentAt: Date | null;
      emailContent: string | null;
      subject: string | null;
      data: Record<string, any>;
    }>;
  };
}

export function CampaignDetailsDialog({
  isOpen,
  onClose,
  campaign,
}: CampaignDetailsDialogProps) {
  const failedLeads = campaign.leads.filter(lead => lead.status === "FAILED" || lead.status === "failed");
  const sentLeads = campaign.leads.filter(lead => lead.status === "SENT" || lead.status === "sent");
  
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();
  
  // Start the glow animation when component mounts
  useState(() => {
    const animateGlow = async () => {
      while (true) {
        await glowControls.start({
          opacity: [0.3, 0.5, 0.3],
          transition: { duration: 3, ease: "easeInOut" }
        });
      }
    };
    
    animateGlow();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 text-gray-200 relative">
        {/* Top illuminated border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
        
        {/* Animated glow spots */}
        <motion.div 
          ref={glowRef}
          animate={glowControls}
          className="absolute top-40 left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30"
        ></motion.div>
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <Terminal className="mr-2 h-5 w-5 text-[#bcee45]" />
            {campaign.name}
          </DialogTitle>
          <p className="text-sm text-gray-400">
            Created on {format(new Date(campaign.createdAt), "PPP")}
          </p>
        </DialogHeader>

        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#232323] p-1 rounded-lg border border-[#323232]">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="failed" 
                className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400  flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Failed ({failedLeads.length})
              </TabsTrigger>
              <TabsTrigger 
                value="sent" 
                className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Sent ({sentLeads.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#161616]/50 backdrop-blur-sm hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                    <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <Package className="h-4 w-4 mr-2 text-[#bcee45]" />
                          Campaign Status
                        </h3>
                        <Badge className={`${
                          campaign.status === "COMPLETED" || campaign.status === "completed" ? 'bg-[#bcee45]/20 text-[#bcee45]' :
                          campaign.status === "SENDING" || campaign.status === "sending" ? 'bg-[#22d3ee]/20 text-[#22d3ee]' :
                          'bg-[#323232] text-gray-300'
                        } border-none`}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#161616]/50 backdrop-blur-sm hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                    <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                        <Terminal className="h-4 w-4 mr-2 text-[#bcee45]" />
                        Email Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-[#323232] text-gray-300 border-none">
                        {campaign.emailType}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#161616]/50 backdrop-blur-sm hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                    <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-[#bcee45]" />
                        Tone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-[#323232] text-gray-300 border-none capitalize">
                        {campaign.tone}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#161616]/50 backdrop-blur-sm hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                    <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                        <BrainCircuit className="h-4 w-4 mr-2 text-[#bcee45]" />
                        Campaign Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400">{campaign.context}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#161616]/50 backdrop-blur-sm hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                  <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-[#bcee45]" />
                      Campaign Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border border-[#323232] rounded-lg p-4 bg-[#232323]/50">
                        <div className="text-sm text-gray-400 mb-1">Total Emails</div>
                        <div className="text-2xl font-bold text-white">{campaign.totalEmails}</div>
                      </div>
                      <div className="border border-[#323232] rounded-lg p-4 bg-[#232323]/50">
                        <div className="text-sm text-gray-400 mb-1">Successful</div>
                        <div className="text-2xl font-bold text-[#bcee45]">{campaign.successful}</div>
                      </div>
                      <div className="border border-[#323232] rounded-lg p-4 bg-[#232323]/50">
                        <div className="text-sm text-gray-400 mb-1">Failed</div>
                        <div className="text-2xl font-bold text-[#ff5555]">{campaign.failed}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="failed" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#161616]/50 backdrop-blur-sm hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                  <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-[#ff5555]" />
                        Failed Emails
                      </h3>
                      <Badge className="bg-[#ff5555]/20 text-[#ff5555] border-none">
                        {failedLeads.length}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {failedLeads.length > 0 ? (
                        failedLeads.map((lead) => (
                          <Card key={lead.id} className="border-[#323232] bg-[#232323]/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-white">{lead.email}</p>
                                  <p className="text-sm text-gray-400 mt-1">{lead.data.error || "Unknown error"}</p>
                                </div>
                                <Badge className="bg-[#ff5555]/20 text-[#ff5555] border-none">Failed</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <div className="p-6 rounded-full bg-[#232323] mb-4">
                            <CheckCircle2 className="h-8 w-8 text-[#bcee45]" />
                          </div>
                          <p>No failed emails in this campaign</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="sent" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#161616]/50 backdrop-blur-sm hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                  <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-[#bcee45]" />
                        Sent Emails
                      </h3>
                      <Badge className="bg-[#bcee45]/20 text-[#bcee45] border-none">
                        {sentLeads.length}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {sentLeads.length > 0 ? (
                        sentLeads.map((lead) => (
                          <Card key={lead.id} className="border-[#323232] bg-[#232323]/50 hover:bg-[#232323] transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-white">{lead.email}</p>
                                  <div className="flex items-center mt-1">
                                    <Clock className="h-3 w-3 text-gray-500 mr-1" />
                                    <p className="text-xs text-gray-400">
                                      {lead.sentAt ? new Date(lead.sentAt).toLocaleString() : "Not sent yet"}
                                    </p>
                                  </div>
                                  {lead.subject && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-300">{lead.subject}</p>
                                    </div>
                                  )}
                                </div>
                                <Badge className="bg-[#bcee45]/20 text-[#bcee45] border-none">Sent</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <div className="p-6 rounded-full bg-[#232323] mb-4">
                            <Mail className="h-8 w-8 text-[#bcee45]" />
                          </div>
                          <p>No emails have been sent yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}