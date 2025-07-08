"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentTypeSelector } from "@/components/dashboard/content/content-type-selector";
import { ContentDetailsForm } from "@/components/dashboard/content/content-details-form";
import { ContentPreview } from "@/components/dashboard/content/content-preview";
import { ContentHistory } from "@/components/dashboard/content/content-history";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  ImageIcon, 
  RefreshCw, 
  CheckCircle, 
  Terminal, 
  BrainCircuit, 
  Zap, 
  ArrowLeft, 
  Code 
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function ContentGeneratorPage() {
  const [activeTab, setActiveTab] = useState("create");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    title?: string;
    content: string;
    imageUrl?: string;
  } | null>(null);
  const [contentDetails, setContentDetails] = useState({
    topic: "",
    tone: "professional",
    length: "medium",
    keywords: "",
    audience: "",
    includeImage: false,
    imageStyle: "modern",
    imagePrompt: ""
  });

  const router = useRouter();
  
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();

  // Start the glow animation when component mounts
  useEffect(() => {
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

  // Reset form when content type changes
  useEffect(() => {
    setCurrentStep(1);
    setGeneratedContent(null);
    setContentDetails({
      topic: "",
      tone: "professional",
      length: "medium",
      keywords: "",
      audience: "",
      includeImage: false,
      imageStyle: "modern",
      imagePrompt: ""
    });
  }, [selectedType]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setCurrentStep(2);
  };

  const handleDetailsSubmit = async (details: any) => {
    setContentDetails(details);
    setCurrentStep(3);
    setIsGenerating(true);

    try {
      // Generate content based on user inputs
      const response = await fetch("/api/dashboard/content-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contentType: selectedType,
          ...details
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      setGeneratedContent(data);
      toast.success("Content generated successfully!", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/dashboard/content-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contentType: selectedType,
          ...contentDetails,
          regenerate: true
        })
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate content");
      }

      const data = await response.json();
      setGeneratedContent(data);
      toast.success("Content regenerated!", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } catch (error) {
      console.error("Error regenerating content:", error);
      toast.error("Failed to regenerate content. Please try again.", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = async () => {
    if (!generatedContent) return;

    try {
      const response = await fetch("/api/dashboard/content-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: selectedType,
          title: generatedContent.title || `${selectedType} - ${new Date().toLocaleString()}`,
          content: generatedContent.content,
          imageUrl: generatedContent.imageUrl,
          metadata: contentDetails
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      toast.success("Content saved successfully!", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
      
      // Reset and go back to start
      setCurrentStep(1);
      setSelectedType("");
      setGeneratedContent(null);
      setActiveTab("history");
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content. Please try again.", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <Zap className="mr-2 h-5 w-5 text-[#bcee45]" />
              Select Content Type
            </h2>
            <ContentTypeSelector onSelect={handleTypeSelect} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep(1)}
                className="mr-2 text-gray-400 hover:text-[#bcee45] hover:bg-[#232323] border-none"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5 text-[#bcee45]" />
                Content Details
              </h2>
            </div>
            <ContentDetailsForm 
              contentType={selectedType} 
              onSubmit={handleDetailsSubmit} 
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep(2)}
                className="mr-2 text-gray-400 hover:text-[#bcee45] hover:bg-[#232323] border-none"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Terminal className="mr-2 h-5 w-5 text-[#bcee45]" />
                Generated Content
              </h2>
            </div>
            
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-6 rounded-full bg-[#232323] mb-4">
                  <RefreshCw className="h-10 w-10 text-[#bcee45] animate-spin" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">Generating amazing content...</h3>
                <p className="text-gray-400 text-center max-w-md">
                  Our neural network is crafting content tailored to your specifications. This may take a moment.
                </p>
                <div className="mt-8 flex flex-col gap-3 max-w-md w-full">
                  <div className="h-2 bg-[#232323] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#bcee45]"
                      animate={{ 
                        width: ["0%", "100%"],
                        transition: { 
                          repeat: Infinity, 
                          duration: 2.5,
                          ease: "easeInOut" 
                        } 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Analyzing topic</span>
                    <span>Creating content</span>
                    <span>Optimizing</span>
                  </div>
                </div>
              </div>
            ) : generatedContent ? (
              <div className="space-y-6">
                <ContentPreview 
                  content={generatedContent} 
                  contentType={selectedType} 
                />
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button 
                    onClick={handleRegenerate} 
                    variant="outline"
                    className="border-[#323232] text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button 
                    onClick={handleSaveContent} 
                    className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save Content
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="p-6 rounded-full bg-[#232323] mb-4">
                  <Code className="h-8 w-8 text-[#bcee45]" />
                </div>
                <p>Something went wrong. Please try again.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                  className="mt-4 border-[#323232] text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                >
                  Go Back
                </Button>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

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
        {/* Content Generator Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mr-3 h-8 w-8 rounded-md bg-[#bcee45] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#161616]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Content <span className="text-[#bcee45]">Generator</span>
              </h1>
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="text-gray-400 ml-11">Create professional marketing content with AI</p>
              {/* Typewriter blinking cursor effect */}
              <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-2 h-4 bg-[#bcee45] animate-blink"></div>
            </motion.div>
          </div>
        </div>

        <Tabs 
          defaultValue="create" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="bg-[#232323] p-1 rounded-lg border border-[#323232]">
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400 flex items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Content
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400 flex items-center"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Content History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="pt-4">
            <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
              {/* Top illuminated border */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
              
              <CardContent className="pt-6">
                {renderCurrentStep()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="pt-4">
            <ContentHistory onEditContent={(content) => {
              // Handle edit functionality
              router.push(`/dashboard/content/edit/${content.id}`);
            }} />
          </TabsContent>
        </Tabs>
        
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