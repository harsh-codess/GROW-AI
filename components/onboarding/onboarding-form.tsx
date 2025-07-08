"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyBasicsForm } from "./company-basics-form";
import { BrandProfileForm } from "./brand-profile-form";
import { ContextCollectionForm } from "./context-collection-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle, Terminal, Code, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

type OnboardingStep = "company-basics" | "brand-profile" | "context-collection";

interface OnboardingData {
  companyBasics: {
    name: string;
    website: string;
    industry: string;
    size: string;
    fundingStage: string;
  };
  brandProfile: {
    logo: File | null;
    primaryColor: string;
    missionStatement: string;
    targetAudience: string;
  };
  contextCollection: {
    documents: File[];
    socialAccounts: string[];
    productDescriptions: string;
    sellingPoints: string;
  };
}

const INITIAL_DATA: OnboardingData = {
  companyBasics: {
    name: "",
    website: "",
    industry: "",
    size: "",
    fundingStage: "",
  },
  brandProfile: {
    logo: null,
    primaryColor: "#bcee45", // Changed to brand lime green
    missionStatement: "",
    targetAudience: "",
  },
  contextCollection: {
    documents: [],
    socialAccounts: [],
    productDescriptions: "",
    sellingPoints: "",
  },
};

export function OnboardingForm() {
  const [step, setStep] = useState<OnboardingStep>("company-basics");
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();

  useEffect(() => {
    // Update progress based on current step
    if (step === "company-basics") setProgress(33);
    if (step === "brand-profile") setProgress(66);
    if (step === "context-collection") setProgress(100);
    
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
  }, [step, glowControls]);

  function updateData(stepId: keyof OnboardingData, fields: Partial<OnboardingData[keyof OnboardingData]>) {
    setData(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        ...fields,
      },
    }));
  }

  function nextStep() {
    if (step === "company-basics") {
      if (!data.companyBasics.name || !data.companyBasics.industry) {
        toast.error("Please fill in required fields", {
          style: {
            background: "#232323",
            color: "white",
            border: "1px solid #323232"
          }
        });
        return;
      }
      setStep("brand-profile");
    } else if (step === "brand-profile") {
      setStep("context-collection");
    }
  }

  function prevStep() {
    if (step === "brand-profile") setStep("company-basics");
    else if (step === "context-collection") setStep("brand-profile");
  }

  async function onSubmit() {
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add company basics data
      formData.append('companyBasics', JSON.stringify(data.companyBasics));
      
      // Add brand profile data (except logo)
      formData.append('brandProfile', JSON.stringify({
        primaryColor: data.brandProfile.primaryColor,
        missionStatement: data.brandProfile.missionStatement,
        targetAudience: data.brandProfile.targetAudience,
      }));
      
      // Add context collection data (except documents)
      formData.append('contextCollection', JSON.stringify({
        socialAccounts: data.contextCollection.socialAccounts,
        productDescriptions: data.contextCollection.productDescriptions,
        sellingPoints: data.contextCollection.sellingPoints,
      }));
      
      // Add logo if exists
      if (data.brandProfile.logo) {
        formData.append('logo', data.brandProfile.logo);
      }
      
      // Add documents
      data.contextCollection.documents.forEach((doc, index) => {
        formData.append(`document-${index}`, doc);
      });

      const response = await fetch("/api/onboarding", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to complete onboarding");
      }

      toast.success("Onboarding completed successfully", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
      
      // Redirect to dashboard after successful onboarding
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to complete onboarding. Please try again.", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-[#bcee45] flex items-center justify-center">
            <Terminal className="h-6 w-6 text-[#161616]" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center text-white">System <span className="text-[#bcee45]">Configuration</span></h1>
        <p className="text-gray-400 text-center">
          Initialize your AI marketing platform with essential parameters
        </p>
        
        <div className="mt-8 mb-2 flex justify-between relative">
          {/* Animated glow background */}
          <motion.div 
            ref={glowRef}
            animate={glowControls}
            className="absolute w-full h-full bg-[#bcee45]/5 rounded-full blur-[80px] z-0"
          ></motion.div>
          
          <div className="flex items-center space-x-2 z-10 relative">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step === "company-basics" ? "bg-[#bcee45] text-[#161616]" : 
              (progress >= 33 ? "bg-[#bcee45] text-[#161616]" : "border-2 border-[#323232] text-gray-400")
            } transition-colors duration-300`}>
              {progress > 33 ? <CheckCircle className="h-5 w-5" /> : "1"}
            </div>
            <span className={`text-sm font-medium ${
              step === "company-basics" ? "text-[#bcee45]" : 
              (progress >= 33 ? "text-gray-300" : "text-gray-500")
            } transition-colors duration-300`}>Entity</span>
          </div>
          
          <div className="w-12 h-0.5 mt-4 bg-[#323232] relative z-10">
            <div 
              className="absolute inset-0 bg-[#bcee45] transition-all duration-700" 
              style={{ width: progress >= 33 ? "100%" : "0%" }}
            />
          </div>
          
          <div className="flex items-center space-x-2 z-10 relative">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step === "brand-profile" ? "bg-[#bcee45] text-[#161616]" : 
              (progress >= 66 ? "bg-[#bcee45] text-[#161616]" : "border-2 border-[#323232] text-gray-400")
            } transition-colors duration-300`}>
              {progress > 66 ? <CheckCircle className="h-5 w-5" /> : "2"}
            </div>
            <span className={`text-sm font-medium ${
              step === "brand-profile" ? "text-[#bcee45]" : 
              (progress >= 66 ? "text-gray-300" : "text-gray-500")
            } transition-colors duration-300`}>Interface</span>
          </div>
          
          <div className="w-12 h-0.5 mt-4 bg-[#323232] relative z-10">
            <div 
              className="absolute inset-0 bg-[#bcee45] transition-all duration-700" 
              style={{ width: progress >= 66 ? "100%" : "0%" }}
            />
          </div>
          
          <div className="flex items-center space-x-2 z-10 relative">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              step === "context-collection" ? "bg-[#bcee45] text-[#161616]" : 
              (progress >= 100 ? "bg-[#bcee45] text-[#161616]" : "border-2 border-[#323232] text-gray-400")
            } transition-colors duration-300`}>
              {progress >= 100 && isSubmitting ? <CheckCircle className="h-5 w-5" /> : "3"}
            </div>
            <span className={`text-sm font-medium ${
              step === "context-collection" ? "text-[#bcee45]" : "text-gray-500"
            } transition-colors duration-300`}>Database</span>
          </div>
        </div>
        
        <div className="mt-2 h-1 w-full bg-[#232323] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#bcee45] to-[#dcff65] transition-all duration-700 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg shadow-black/20 relative group">
        {/* Top illuminated border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
        
        {/* Animated corner piece */}
        <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
        </div>
        
        <CardHeader className="border-b border-[#323232] bg-[#1a1a1a]">
          <CardTitle className="text-white flex items-center">
            {step === "company-basics" && (
              <>
                <Code className="h-4 w-4 mr-2 text-[#bcee45]" />
                <span>Entity Configuration</span>
              </>
            )}
            {step === "brand-profile" && (
              <>
                <Sparkles className="h-4 w-4 mr-2 text-[#bcee45]" />
                <span>Interface Customization</span>
              </>
            )}
            {step === "context-collection" && (
              <>
                <Terminal className="h-4 w-4 mr-2 text-[#bcee45]" />
                <span>Database Population</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-6">
              {step === "company-basics" && (
                <CompanyBasicsForm
                  data={data.companyBasics}
                  updateData={(fields) => updateData("companyBasics", fields)}
                />
              )}
              {step === "brand-profile" && (
                <BrandProfileForm
                  data={data.brandProfile}
                  updateData={(fields) => updateData("brandProfile", fields)}
                />
              )}
              {step === "context-collection" && (
                <ContextCollectionForm
                  data={data.contextCollection}
                  updateData={(fields) => updateData("contextCollection", fields)}
                />
              )}
            </CardContent>
          </motion.div>
        </AnimatePresence>
        
        <CardFooter className="flex justify-between py-4 px-6 border-t border-[#323232] bg-[#1a1a1a]">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === "company-basics" || isSubmitting}
            className="flex items-center bg-[#161616] border-[#161616] text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {step !== "context-collection" ? (
            <Button 
              onClick={nextStep} 
              disabled={isSubmitting}
              className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          ) : (
            <Button 
              onClick={onSubmit} 
              disabled={isSubmitting}
              className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="relative z-10">
                {isSubmitting ? "Initializing System..." : "Launch Platform"}
              </span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}