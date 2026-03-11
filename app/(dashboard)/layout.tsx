// app/(dashboard)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SideNav } from "@/components/dashboard/side-nav";
import { UserAccountNav } from "@/components/dashboard/user-account-nav";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Menu, X, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch the current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUser({
            name: data.user.name,
            email: data.user.email,
            image: data.user.image,
          });
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-[#161616] text-gray-200 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 z-0">
        {/* Grid pattern */}
        <div className="grid-pattern absolute inset-0 opacity-5" />
        
        {/* Glow spots */}
        <div className="absolute top-40 left-20 w-96 h-96 bg-[#bcee45]/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-20"></div>
        
        {/* Floating elements - will be hidden on mobile */}
        <div className="hidden md:block absolute top-20 right-[10%] animate-[move1_7s_infinite_linear] opacity-10">
          <div className="w-16 h-16 rounded-full border border-[#bcee45]/30"></div>
        </div>
        <div className="hidden md:block absolute bottom-20 left-[15%] animate-[flicker_3s_infinite_linear_alternate] opacity-10">
          <div className="w-24 h-24 rounded-full border border-purple-500/30"></div>
        </div>
        <div className="hidden md:block absolute top-[30%] right-[20%] animate-[rotate360_10s_infinite_linear] opacity-10">
          <div className="w-32 h-32 rounded-full border border-cyan-500/30"></div>
        </div>
      </div>
      
      <header className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-gray-800/50 shadow-lg shadow-black/30">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group">
                <span className="ml-4 text-xl font-bold text-[#bcee45]">Grow AI</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {isLoadingUser ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            ) : user ? (
              <UserAccountNav user={user} />
            ) : (
              <Link href="/auth/login">
                <Button size="sm" className="bg-gradient-to-r from-[#bcee45] to-[#9bc42c] hover:from-[#dcff65] hover:to-[#bcee45] text-[#161616] font-medium border-0">
                  Sign In
                </Button>
              </Link>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-400 hover:text-white hover:bg-gray-800/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 relative z-10">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r border-gray-800/50 md:sticky md:block bg-[#121212]/50 backdrop-blur-sm">
          <SideNav />
        </aside>
        
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="fixed inset-0 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <motion.div 
                className="absolute top-16 left-0 bottom-0 w-3/4 bg-[#161616] shadow-xl border-r border-gray-800/50"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.2 }}
              >
                <SideNav />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <main className="flex w-full flex-col overflow-hidden p-4 md:py-8">
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          )}
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#161616',
            color: '#e5e7eb',
            border: '1px solid #2c2c2c'
          }
        }}
      />
      
      {/* CSS for grid pattern */}
      <style jsx global>{`
        .grid-pattern {
          background-size: 25px 25px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
        
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