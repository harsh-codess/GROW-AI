"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Mail, 
  BarChart, 
  Users, 
  Settings, 
  Terminal, 
  Zap,
  FileText,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { processCSV } from "@/actions/mailMarketing/ProcessCsv";
import { EmailConfigDialog } from "./components/EmailConfigDialog";
import { CampaignDetailsDialog } from "./components/CampaignDetailsDialog";
import { getActiveCampaigns, getTotalEmailsSent, getRecentCampaigns } from "@/actions/mailMarketing/GetCampaignStats";
import { getCampaignAnalytics } from "@/actions/mailMarketing/GetCampaignAnalytics";
import { generateAndSendEmails } from "@/actions/mailMarketing/GenerateEmails";
import { EmailTemplates } from "./components/EmailTemplates";
import { EmailPreviewDialog } from "./components/EmailPreviewDialog";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Lead {
  id: string;
  email: string;
  status: string;
  sentAt: Date | null;
  emailContent: string | null;
  subject: string | null;
  data: Record<string, any>;
}

interface Campaign {
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
  leads: Lead[];
}

interface Analytics {
  totalCampaigns: number;
  totalEmailsSent: number;
  totalEmailsFailed: number;
  averageOpenRate: number;
  campaigns: Campaign[];
}

export default function EmailMarketingPage() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<{
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
    leads: {
      id: string;
      email: string;
      name: string | null;
      status: string;
      sentAt: Date | null;
      data: Record<string, any>;
    }[];
  } | null>(null);
  const [csvData, setCsvData] = useState<{
    headers: string[];
    data: Record<string, string>[];
    totalRows: number;
  } | null>(null);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalEmailsSent: 0,
    recentCampaigns: []
  });
  const [analytics, setAnalytics] = useState<Analytics>({
    totalCampaigns: 0,
    totalEmailsSent: 0,
    totalEmailsFailed: 0,
    averageOpenRate: 0,
    campaigns: []
  });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<{
    email: string;
    status: string;
    subject: string | null;
    sentAt: Date | null;
    emailContent: string | null;
  } | null>(null);

  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const [activeCampaigns, totalEmailsSent, recentCampaigns] = await Promise.all([
          getActiveCampaigns(),
          getTotalEmailsSent(),
          getRecentCampaigns()
        ]);
        
        setStats({
          activeCampaigns,
          totalEmailsSent,
          recentCampaigns: recentCampaigns as []
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        toast.error("Failed to load campaign statistics", {
          style: {
            background: "#232323",
            color: "white",
            border: "1px solid #323232"
          }
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
    
    // Animate the glow effect
    const animateGlow = async () => {
      while (true) {
        await glowControls.start({
          opacity: [0.3, 0.5, 0.3],
          transition: { duration: 3, ease: "easeInOut" }
        });
      }
    };
    
    animateGlow();
  }, [glowControls]);

  const handleFileUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    try {
      const result = await processCSV(formData);
      setCsvData(result);
      setIsDialogOpen(true);
      toast.success("CSV file processed successfully", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } catch (error) {
      console.error("Failed to process CSV:", error);
      toast.error("Failed to process CSV file", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    if (value === "analytics") {
      setIsLoadingAnalytics(true);
      try {
        const analyticsData = await getCampaignAnalytics();
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Failed to load analytics data", {
          style: {
            background: "#232323",
            color: "white",
            border: "1px solid #323232"
          }
        });
      } finally {
        setIsLoadingAnalytics(false);
      }
    }
  };

  const startPolling = () => {
    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Start new polling interval
    const interval = setInterval(async () => {
      try {
        const [activeCampaigns, totalEmailsSent, recentCampaigns] = await Promise.all([
          getActiveCampaigns(),
          getTotalEmailsSent(),
          getRecentCampaigns()
        ]);

        setStats({
          activeCampaigns,
          totalEmailsSent,
          recentCampaigns: recentCampaigns as []
        });

        // If no active campaigns, stop polling
        if (activeCampaigns === 0) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      } catch (error) {
        console.error("Failed to fetch campaign updates:", error);
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  };

  const handleCampaignStart = async (config: {
    tone: string;
    emailType: string;
    context: string;
    template: string;
  }) => {
    if (!csvData) return;

    try {
      await generateAndSendEmails({
        csvData,
        tone: config.tone,
        emailType: config.emailType,
        context: config.context,
        template: config.template
      });

      toast.success("Email campaign started successfully", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });

      // Update stats immediately
      const [activeCampaigns, totalEmailsSent, recentCampaigns] = await Promise.all([
        getActiveCampaigns(),
        getTotalEmailsSent(),
        getRecentCampaigns()
      ]);

      setStats({
        activeCampaigns,
        totalEmailsSent,
        recentCampaigns: recentCampaigns as []
      });

      // If there are active campaigns, start polling
      if (activeCampaigns > 0) {
        startPolling();
      }
    } catch (error) {
      console.error("Failed to start campaign:", error);
      toast.error("Failed to start email campaign", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    }
  };

  // Cleanup polling interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Ambient background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#161616]"></div>
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        
        {/* Animated glow spots */}
        <motion.div 
          ref={glowRef}
          animate={glowControls}
          className="absolute top-40 left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30"
        ></motion.div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30"></div>
      </div>
      
      <motion.div 
        className="flex flex-col space-y-6 text-gray-200 min-h-screen px-4 sm:px-6 py-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Email Marketing Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mr-3 h-8 w-8 rounded-md bg-[#bcee45] flex items-center justify-center">
                <Mail className="h-4 w-4 text-[#161616]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Email <span className="text-[#bcee45]">Marketing</span>
              </h1>
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="text-gray-400 ml-11">Create and manage AI-powered email campaigns</p>
              {/* Typewriter blinking cursor effect */}
              <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-2 h-4 bg-[#bcee45] animate-blink"></div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button 
              className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
              onClick={() => setActiveTab("contacts")}
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <Mail className="mr-2 h-4 w-4 relative z-10" />
              <span className="relative z-10">New Campaign</span>
            </Button>
          </motion.div>
        </div>

        <Tabs defaultValue="campaigns" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-[#232323] p-1 rounded-lg border border-[#323232]">
            <TabsTrigger 
              value="campaigns" 
              className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400"
            >
              <Mail className="mr-2 h-4 w-4" />
              Campaigns Activity
            </TabsTrigger>
            <TabsTrigger 
              value="contacts" 
              className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400"
            >
              <Users className="mr-2 h-4 w-4" />
              Create Campaigns
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400"
            >
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400"
            >
              <Settings className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                  {/* Glowing border effect on hover */}
                  <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                  
                  {/* Animated corner piece */}
                  <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-[#bcee45]" />
                      Active Campaigns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="h-8 w-16 bg-[#232323] rounded animate-pulse mb-2"></div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-white">{stats.activeCampaigns}</div>
                        <div className="text-xs text-gray-500">Currently running campaigns</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                  {/* Glowing border effect on hover */}
                  <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                  
                  {/* Animated corner piece */}
                  <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-[#bcee45]" />
                      Total Emails Sent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="h-8 w-16 bg-[#232323] rounded animate-pulse mb-2"></div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-white">{stats.totalEmailsSent}</div>
                        <div className="text-xs text-gray-500">This month</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                  {/* Glowing border effect on hover */}
                  <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                  
                  {/* Animated corner piece */}
                  <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-[#bcee45]" />
                      Average Open Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="h-8 w-16 bg-[#232323] rounded animate-pulse mb-2"></div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-white">24.5%</div>
                        <div className="text-xs text-gray-500">Last 30 days</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                {/* Top illuminated border */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BrainCircuit className="mr-2 h-4 w-4 text-[#bcee45]" />
                    Recent Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, index) => (
                        <div key={`skeleton-${index}`} className="border border-[#323232] rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="h-5 w-36 bg-[#232323] rounded animate-pulse mb-2"></div>
                              <div className="h-4 w-24 bg-[#232323] rounded animate-pulse"></div>
                            </div>
                            <div className="h-6 w-20 bg-[#232323] rounded animate-pulse"></div>
                          </div>
                          <div className="mt-4">
                            <div className="h-4 w-32 bg-[#232323] rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : stats.recentCampaigns.length > 0 ? (
                    <div className="space-y-4">
                      {(stats.recentCampaigns as any[]).map((campaign: any) => (
                        <div 
                          key={campaign.id} 
                          className="border border-[#323232] rounded-lg p-4 hover:bg-[#232323]/50 hover:border-[#bcee45]/20 transition-all cursor-pointer"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-white">{campaign.name}</h3>
                              <p className="text-xs text-gray-400">
                                {new Date(campaign.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={`${
                              campaign.status === 'completed' ? 'bg-[#bcee45]/20 text-[#bcee45]' :
                              campaign.status === 'sending' ? 'bg-[#22d3ee]/20 text-[#22d3ee]' :
                              'bg-[#323232] text-gray-300'
                            } border-none`}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-400">
                              {campaign.leads.filter((lead: any) => lead.status === 'sent').length} emails sent
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <div className="p-6 rounded-full bg-[#232323] mb-4">
                        <Mail className="h-8 w-8 text-[#bcee45]" />
                      </div>
                      <p>No campaigns yet. Create your first campaign!</p>
                      <Button 
                        className="mt-4 bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium"
                        onClick={() => setActiveTab("contacts")}
                      >
                        <span className="flex items-center">
                          <Zap className="mr-2 h-4 w-4" />
                          Start New Campaign
                        </span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                {/* Top illuminated border */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Upload className="mr-2 h-4 w-4 text-[#bcee45]" />
                    Import Contacts
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload a CSV file containing your contacts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#323232] rounded-lg bg-[#232323]/50 hover:bg-[#232323] transition-colors">
                    <div className="p-4 rounded-full bg-[#bcee45]/20 mb-4">
                      <Upload className="h-10 w-10 text-[#bcee45]" />
                    </div>
                    <p className="text-gray-400 mb-2">
                      Drag and drop your contacts CSV file here
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supports CSV files - Headers should include 'email' column
                    </p>
                    <div className="grid w-full max-w-sm items-center gap-4">
                      <input 
                        id="csv" 
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef} 
                        className="hidden"
                      />
                      <div className="flex gap-4">
                        <label htmlFor="csv">
                          <Button 
                            className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                            <span className="relative z-10 flex items-center">
                              <Upload className="mr-2 h-4 w-4" />
                              Select File
                            </span>
                          </Button>
                        </label>
                        <Button 
                          className="bg-[#232323] border border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                          onClick={handleFileUpload}
                        >
                          <Terminal className="mr-2 h-4 w-4" />
                          Process File
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
                    <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-start gap-3">
                      <BrainCircuit className="h-4 w-4 text-[#bcee45] mt-1" />
                      <div>
                        <p className="text-sm text-gray-300 mb-1">AI-Powered Campaign Generation</p>
                        <p className="text-xs text-gray-400">
                          Upload your contacts and let our AI generate personalized email campaigns based on your requirements. The system supports custom templates and multiple tones.
                        </p>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-12 w-12 animate-spin text-[#bcee45]" />
              </div>
            ) : (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                      <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-[#bcee45]" />
                          Total Campaigns
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{analytics.totalCampaigns}</div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                      <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-[#bcee45]" />
                          Total Emails Sent
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{analytics.totalEmailsSent}</div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                      <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                          <XCircle className="mr-2 h-4 w-4 text-[#ff5555]" />
                          Failed Emails
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{analytics.totalEmailsFailed}</div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                      <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center">
                          <TrendingUp className="mr-2 h-4 w-4 text-[#bcee45]" />
                          Average Open Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">{analytics.averageOpenRate.toFixed(2)}%</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                    {/* Top illuminated border */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                    
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-white flex items-center">
                            <BrainCircuit className="mr-2 h-4 w-4 text-[#bcee45]" />
                            Email History
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Detailed view of all sent emails
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border border-[#323232] bg-[#1a1a1a]">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-[#323232] hover:bg-transparent">
                              <TableHead className="text-gray-400">Email</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-gray-400">Subject</TableHead>
                              <TableHead className="text-gray-400">Sent</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.campaigns.flatMap(campaign =>
                              campaign.leads.map(lead => (
                                <TableRow
                                  key={lead.id}
                                  className="border-b border-[#323232] cursor-pointer hover:bg-[#232323]"
                                  onClick={() => setSelectedEmail({
                                    email: lead.email,
                                    status: lead.status,
                                    subject: lead.subject,
                                    sentAt: lead.sentAt,
                                    emailContent: lead.emailContent
                                  })}
                                >
                                  <TableCell className="text-gray-300">{lead.email}</TableCell>
                                  <TableCell>
                                    <Badge className={`${
                                      lead.status === "sent" ? 'bg-[#bcee45]/20 text-[#bcee45]' :
                                      lead.status === "failed" ? 'bg-[#ff5555]/20 text-[#ff5555]' :
                                      'bg-[#323232] text-gray-300'
                                    } border-none`}>
                                      {lead.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-gray-300">{lead.subject || "No subject"}</TableCell>
                                  <TableCell className="text-gray-400">
                                    {lead.sentAt ? formatDistanceToNow(new Date(lead.sentAt), { addSuffix: true }) : "Not sent yet"}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                {/* Top illuminated border */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="mr-2 h-4 w-4 text-[#bcee45]" />
                    Email Settings
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure your email templates and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Terminal className="mr-2 h-4 w-4 text-[#bcee45]" />
                        Email Templates
                      </h3>
                      <EmailTemplates
                        onTemplateSelect={(template) => {
                          setSelectedTemplate(template);
                          toast.success("Template selected successfully", {
                            style: {
                              background: "#232323",
                              color: "white",
                              border: "1px solid #323232"
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {csvData && (
          <EmailConfigDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            csvData={csvData}
            onCampaignStart={handleCampaignStart}
          />
        )}

        {selectedCampaign && (
          <CampaignDetailsDialog
            isOpen={!!selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
            campaign={selectedCampaign}
          />
        )}

        {selectedEmail && (
          <EmailPreviewDialog
            isOpen={!!selectedEmail}
            onClose={() => setSelectedEmail(null)}
            email={selectedEmail}
          />
        )}
        
        {/* CSS for animations */}
        <style jsx global>{`
          .grid-pattern {
            background-size: 25px 25px;
            background-image: 
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          }
          
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          
          .animate-blink {
            animation: blink 1s infinite;
          }
        `}</style>
      </motion.div>
    </div>
  );
}