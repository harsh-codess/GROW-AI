// app/(auth)/onboarding/page.tsx
"use client";

import { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";


export default function OnboardingPage() {

  return (
    <div className="min-h-screen py-12 px-4 bg-[#161616] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="grid-pattern absolute inset-0 opacity-10"></div>
        
        {/* Gradient glows */}
        <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-[#bcee45]/10 to-transparent"></div>
        <div className="absolute top-[30vh] left-[20vw] w-[40vw] h-[40vh] rounded-full bg-[#bcee45]/5 blur-[100px]"></div>
        <div className="absolute bottom-[20vh] right-[10vw] w-[30vw] h-[30vh] rounded-full bg-[#bcee45]/5 blur-[100px]"></div>
        
        {/* Animated shapes */}
        <div className="hidden md:block absolute top-[20vh] left-[10vw] w-8 h-8 border border-[#bcee45]/30 rounded-full animate-[move1_15s_infinite_linear]"></div>
        <div className="hidden md:block absolute top-[70vh] right-[15vw] w-6 h-6 border border-[#bcee45]/30 rounded-full animate-[flicker_10s_infinite_linear_alternate]"></div>
        <div className="hidden md:block absolute top-[40vh] right-[30vw] w-12 h-12 border border-[#bcee45]/20 rounded-full animate-[rotate360_20s_infinite_linear]"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <OnboardingForm />
      </motion.div>
      
      {/* Global CSS for animations */}
      <style jsx global>{`
        /* Grid pattern */
        .grid-pattern {
          background-size: 25px 25px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
        
        /* Animations */
        @keyframes move1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, 20px); }
          50% { transform: translate(0, 40px); }
          75% { transform: translate(-20px, 20px); }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes rotate360 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.3; box-shadow: 0 0 20px rgba(188, 238, 69, 0.1); }
          50% { opacity: 0.6; box-shadow: 0 0 30px rgba(188, 238, 69, 0.2); }
        }
        
        .glow-animation {
          animation: glow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}