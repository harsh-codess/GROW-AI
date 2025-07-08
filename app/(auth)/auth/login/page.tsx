// app/(auth)/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/login-form";
import { Zap, Terminal, MessageSquare, Image as ImageIcon, Phone } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#161616]">
      {/* Left Side - Branding */}
      <div className="w-full md:w-1/2 bg-[#161616] p-8 flex items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Grid pattern */}
          <div className="grid-pattern absolute inset-0 opacity-10"></div>
          
          {/* Gradient glows */}
          <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-[#bcee45]/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-[60vw] h-[40vh] rounded-full bg-[#bcee45]/5 blur-[100px]"></div>
          
          {/* Animated shapes */}
          <div className="hidden md:block absolute top-[20vh] left-[10vw] w-8 h-8 border border-[#bcee45]/30 rounded-full animate-[move1_15s_infinite_linear]"></div>
          <div className="hidden md:block absolute bottom-[10vh] right-[15vw] w-6 h-6 border border-[#bcee45]/30 rounded-full animate-[flicker_10s_infinite_linear_alternate]"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto text-white relative z-10"
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center">
              <Terminal className="mr-3 h-8 w-8 text-[#bcee45]" />
              <img src="/logo.png" alt="Logo" height={100} width={100} />
            </h1>
            <p className="text-lg md:text-xl text-gray-400">
              AI-Powered Marketing Suite for Startups
            </p>
          </div>
          
          <div className="bg-[#1a1a1a] backdrop-blur-sm rounded-xl p-6 space-y-6 border border-[#323232] relative">
            {/* Top illuminated border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
            
            <div className="flex items-start gap-4">
              <div className="bg-[#bcee45] rounded-lg p-2">
                <Terminal className="h-5 w-5 text-[#161616]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white">AI-Powered Content</h3>
                <p className="text-sm text-gray-400">Generate professional marketing content in seconds</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-[#bcee45] rounded-lg p-2">
                <ImageIcon className="h-5 w-5 text-[#161616]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white">Stunning Visuals</h3>
                <p className="text-sm text-gray-400">Transform product photos into professional marketing images</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-[#bcee45] rounded-lg p-2">
                <Phone className="h-5 w-5 text-[#161616]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white">AI Voice Agents</h3>
                <p className="text-sm text-gray-400">Let AI handle customer calls and qualify leads 24/7</p>
              </div>
            </div>
            
            {/* Interactive element */}
            <div className="mt-6 p-4 bg-[#232323] rounded-lg border border-[#323232] relative overflow-hidden group hover:border-[#bcee45]/30 transition-all">
              {/* Edge glow effect */}
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden border border-[#323232] flex-shrink-0">
                  <img 
                    src="https://randomuser.me/api/portraits/women/44.jpg" 
                    alt="User" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=Sarah+J&background=bcee45&color=161616`;
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-[#bcee45] transition-colors">Sarah J.</p>
                  <p className="text-xs text-gray-500">Founder, TechStart</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                "FlowAI has completely transformed our marketing strategy. We've increased engagement by 40% while cutting our time investment in half."
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#1a1a1a]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white">System <span className="text-[#bcee45]">Access</span></h2>
            <p className="text-gray-400 mt-2">
              Sign in to your account to continue
            </p>
          </div>
          
          <LoginForm />
          
          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-[#bcee45] hover:text-[#dcff65] hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
      
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
      `}</style>
    </div>
  );
}