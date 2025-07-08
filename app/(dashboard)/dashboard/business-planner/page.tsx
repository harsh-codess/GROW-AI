"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Zap, ChevronRight, BrainCircuit, Rocket, Target, Calendar, Users, DollarSign, BarChart, Sparkles, ChevronLeft } from "lucide-react";
import { PlannerForm } from "@/components/dashboard/business-planner/planner-form";
import { PlanTimeline } from "@/components/dashboard/business-planner/plan-timeline";
import { PlanList } from "@/components/dashboard/business-planner/plan-list";
import { toast } from "sonner";
import axios from "axios";

// Define interface for BusinessPlan type
interface BusinessPlan {
  id: string;
  name: string;
  planData: any;
  status: string;
  createdAt: string;
  updatedAt: string;
  milestones: any[];
}

export default function BusinessPlannerPage() {
  // Possible view states: "list", "form", "processing", "result"
  const [view, setView] = useState<"list" | "form" | "processing" | "result">("list");
  const [formData, setFormData] = useState<any>({});
  const [planData, setPlanData] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Initializing your business plan...");

  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();

  // Loading messages to display during AI processing
  const loadingMessages = [
    "Analyzing market dynamics...",
    "Evaluating competitive landscape...",
    "Calculating resource allocation...",
    "Generating marketing strategy...",
    "Creating product development roadmap...",
    "Defining key performance metrics...",
    "Optimizing launch timeline...",
    "Identifying growth opportunities...",
    "Establishing milestone framework...",
    "Finalizing business plan..."
  ];

  // Handle form submission
  const handleFormSubmit = async (data: any) => {
    setFormData(data);
    setView("processing");
    setLoading(true);
    setLoadingProgress(0);

    // Simulate progress with messages
    const intervalId = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) {
          clearInterval(intervalId);
          return 95;
        }
        const newProgress = prev + Math.floor(Math.random() * 5) + 1;
        setLoadingMessage(loadingMessages[Math.floor((newProgress / 100) * loadingMessages.length)]);
        return newProgress <= 95 ? newProgress : 95;
      });
    }, 1500);

    try {
      // Call your API endpoint to generate the business plan
      const response = await axios.post('/api/dashboard/business-planner', data);
      
      if (response.data) {
        setPlanData(response.data);
        setSelectedPlan(response.data);
        setView("result");
        setLoadingProgress(100);
        setLoadingMessage("Business plan ready!");
        
        toast.success("Your business plan has been generated successfully!", {
          style: {
            background: "#232323",
            color: "white",
            border: "1px solid #323232"
          }
        });
      }
    } catch (error) {
      console.error("Error generating business plan:", error);
      toast.error("Failed to generate business plan. Please try again.", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
      setView("form");
    } finally {
      clearInterval(intervalId);
      setLoading(false);
    }
  };

  // Handle selecting a plan from the list
  const handleSelectPlan = (plan: BusinessPlan) => {
    setSelectedPlan(plan);
    setPlanData(plan.planData);
    setView("result");
  };

  // Handle creating a new plan
  const handleNewPlan = () => {
    setView("form");
    setSelectedPlan(null);
    setPlanData(null);
  };

  // Handle going back to the plan list
  const handleBackToList = () => {
    setView("list");
    setSelectedPlan(null);
    setPlanData(null);
  };

  return (
    <div className="flex flex-col space-y-6 text-gray-200 min-h-screen relative">
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
      
      {/* Header */}
      <div className="z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-md bg-[#bcee45] flex items-center justify-center">
            <BrainCircuit className="h-5 w-5 text-[#161616]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Business <span className="text-[#bcee45]">Planner</span>
            </h1>
            <p className="text-gray-400">Generate a strategic business plan with AI</p>
          </div>
        </div>
        
        {/* Navigation buttons */}
        {view !== "list" && (
          <Button 
            onClick={handleBackToList} 
            variant="outline" 
            className="bg-[#232323] border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
        )}
      </div>
      
      {/* Main Content */}
      <div className="z-10 grid grid-cols-1 gap-8">
        {view === "list" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PlanList onSelectPlan={handleSelectPlan} onNewPlan={handleNewPlan} />
          </motion.div>
        )}
        
        {view === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
              {/* Top illuminated border */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
              
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Terminal className="h-4 w-4 mr-2 text-[#bcee45]" />
                  Configure Your Business Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Form Component */}
                <PlannerForm onSubmit={handleFormSubmit} />
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {view === "processing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[70vh] flex flex-col items-center justify-center"
          >
            <Card className="w-full max-w-3xl border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
              
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center justify-center text-center space-y-8">
                  {/* Neural network animation */}
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 border-4 border-[#bcee45]/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#bcee45] border-t-transparent rounded-full animate-spin"></div>
                    
                    {/* Neural nodes animated effect */}
                    <div className="absolute inset-0 scale-75">
                      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#bcee45] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#bcee45] rounded-full animate-pulse"></div>
                      <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-[#bcee45] rounded-full animate-pulse delay-300"></div>
                      <div className="absolute top-1/4 left-3/4 w-2 h-2 bg-[#bcee45] rounded-full animate-pulse delay-500"></div>
                      <div className="absolute top-3/4 left-3/4 w-2 h-2 bg-[#bcee45] rounded-full animate-pulse delay-700"></div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-2xl font-bold text-[#bcee45] animate-pulse">{loadingMessage}</div>
                  
                  <div className="w-full max-w-md h-2 bg-[#232323] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#bcee45] to-[#dcff65] transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-4 max-w-lg">
                    <p className="text-sm text-center text-gray-400">
                      <Terminal className="inline-block h-4 w-4 mr-1 text-[#bcee45]" /> 
                      Our AI is analyzing your business details and crafting a comprehensive strategic plan. This typically takes 30-60 seconds.
                    </p>
                  </div>
                  
                  {/* Matrix-like code effect in background */}
                  <div className="matrix-code absolute inset-0 opacity-5 pointer-events-none overflow-hidden"></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {view === "result" && planData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
              
              <CardHeader className="border-b border-[#323232]">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white flex items-center">
                    <Rocket className="h-4 w-4 mr-2 text-[#bcee45]" />
                    Strategic Business Plan: {planData.businessName}
                  </CardTitle>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#232323] border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                      onClick={() => window.print()}
                    >
                      <span className="flex items-center">
                        Export Plan
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#232323] border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                      onClick={handleNewPlan}
                    >
                      <span className="flex items-center">
                        Create New Plan
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Plan Overview */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="md:w-1/3">
                      <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] h-full">
                        <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-[#bcee45]" />
                          Executive Summary
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {planData.executiveSummary}
                        </p>
                      </div>
                    </div>
                    
                    <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232]">
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-[#bcee45]" />
                          Target Market
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {planData.targetMarket}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232]">
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                          <BarChart className="h-4 w-4 mr-2 text-[#bcee45]" />
                          Competitive Advantage
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {planData.competitiveAdvantage}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232]">
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-[#bcee45]" />
                          Revenue Model
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {planData.revenueModel}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232]">
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-[#bcee45]" />
                          Key Milestones
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {planData.keyMilestonesShort}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Timeline */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-[#bcee45]" />
                    Strategic Roadmap Timeline
                  </h2>
                  
                  {/* Timeline component */}
                  <PlanTimeline timelineData={selectedPlan?.milestones || planData.timeline} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* CSS for animations */}
      <style jsx global>{`
        .grid-pattern {
          background-size: 25px 25px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
        
        @keyframes matrix-fall {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 0 1000px;
          }
        }
        
        .matrix-code {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0.03;
          z-index: -1;
        }

        .matrix-code::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='0' y='10' fill='%23bcee45'%3E01%3C/text%3E%3Ctext x='20' y='30' fill='%23bcee45'%3E10%3C/text%3E%3Ctext x='40' y='50' fill='%23bcee45'%3E01%3C/text%3E%3Ctext x='60' y='70' fill='%23bcee45'%3E10%3C/text%3E%3Ctext x='80' y='90' fill='%23bcee45'%3E01%3C/text%3E%3C/svg%3E");
          animation: matrix-fall 20s linear infinite;
        }
      `}</style>
    </div>
  );
}