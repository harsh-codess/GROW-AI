// components/dashboard/user-account-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell,
  Loader2,
  Crown,
  Zap,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface UserAccountNavProps {
  user: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Make a real API call to logout endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      toast.success("Logged out successfully");
      
      // Redirect to login page
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Stats Button */}
      <Button variant="ghost" size="icon" className="hidden md:flex text-gray-400 hover:text-[#bcee45] hover:bg-[#232323]">
        <Zap className="h-5 w-5" />
      </Button>
      
      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-[#bcee45] hover:bg-[#232323]">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#bcee45] ring-2 ring-[#161616]"></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 shadow-xl shadow-black/20">
          <DropdownMenuLabel className="text-gray-300">Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
          <div className="py-6 text-center text-sm text-gray-500">
            No new notifications
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#bcee45] to-[#9bc42c] opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <Avatar className="h-9 w-9 border-2 border-[#2a2a2a] group-hover:border-[#bcee45]/50 transition-colors">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="bg-gradient-to-r from-[#bcee45] to-[#9bc42c] text-[#161616]">
                {user.name?.charAt(0) || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 shadow-xl shadow-black/20">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-gray-200">{user.name}</p>
              <p className="text-xs leading-none text-gray-500">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
          <DropdownMenuItem asChild className="text-gray-300 focus:bg-[#232323] focus:text-white">
            <Link href="/dashboard/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-gray-300 focus:bg-[#232323] focus:text-white">
            <Link href="/dashboard/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-gray-300 focus:bg-[#232323] focus:text-white">
            <Link href="/help" className="flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
          
          {/* Premium plan feature */}
          <div className="px-2 py-1.5 text-xs">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="flex items-center">
                <Crown className="h-3 w-3 mr-1 text-[#bcee45]" />
                <span className="text-[#bcee45] font-medium">Free Plan</span>
              </span>
              <span className="text-xs text-gray-500">65% used</span>
            </div>
            <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#bcee45] to-[#9bc42c] w-[65%] rounded-full"></div>
            </div>
            <Link href="/pricing" className="flex items-center justify-between mt-2 text-xs text-gray-400 hover:text-[#bcee45]">
              <span>Upgrade to Pro</span>
              <Sparkles className="h-3 w-3 text-[#bcee45]" />
            </Link>
          </div>
          
          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
          <DropdownMenuItem
            className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-[#232323]"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}