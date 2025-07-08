// components/dashboard/side-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Image,
  MessageSquare,
  Phone,
  FileText,
  Mail,
  BarChart,
  Users,
  Settings,
  Zap,
  Sparkles,
  ChevronRight,
  Video,
  BrainCircuit
} from "lucide-react";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
  },
  {
    title: "AI VideoShoot",
    href: "/dashboard/video",
    icon: <Video className="mr-2 h-4 w-4" />,
    isNew: true
  },
  {
    title: "AI Photoshoot",
    href: "/dashboard/photoshoot",
    icon: <Image className="mr-2 h-4 w-4" />,
    // isNew: true
  },
  // {
  //   title: "Marketing Chat",
  //   href: "/dashboard/chat",
  //   icon: <MessageSquare className="mr-2 h-4 w-4" />,
  // },
  {
    title: "Voice Agent",
    href: "/dashboard/voice-agent",
    icon: <Phone className="mr-2 h-4 w-4" />,
  },
  
  {
    title: "Email Marketing",
    href: "/dashboard/email",
    icon: <Mail className="mr-2 h-4 w-4" />,
  },
  {
    title: "Business Planner",
    href: "/dashboard/business-planner",
    icon: <BrainCircuit className="mr-2 h-4 w-4" />,
  },
  {
    title: "Content Generator",
    href: "/dashboard/content",
    icon: <FileText className="mr-2 h-4 w-4" />,
  },

  // {
  //   title: "Analytics",
  //   href: "/dashboard/analytics",
  //   icon: <BarChart className="mr-2 h-4 w-4" />,
  // },
  // {
  //   title: "Competition",
  //   href: "/dashboard/competition",
  //   icon: <Users className="mr-2 h-4 w-4" />,
  // },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2 py-6 px-3">
      <div className="mb-4 px-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Main
        </h3>
      </div>

      <div className="relative">
        {sidebarNavItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <Link
                href={item.href}
                className="relative block my-2"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start py-2 relative group border border-transparent",
                    isActive
                      ? "text-[#161616] bg-[#bcee45] font-medium shadow-md shadow-[#bcee45]/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#232323] hover:border-[#323232]/60"
                  )}
                >
                  {/* Glowing effect for active item */}
                  {isActive && (
                    <div className="absolute -inset-[1px] rounded-md bg-[#bcee45] opacity-30 blur-sm -z-10"></div>
                  )}

                  {isActive ? (
                    <>
                      <span className="text-[#161616]">{item.icon}</span>
                      <motion.span
                        className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -5, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <ChevronRight className="h-4 w-4 text-[#161616]" />
                      </motion.span>
                    </>
                  ) : (
                    <span className="group-hover:text-[#dcff65] transition-colors">{item.icon}</span>
                  )}
                  {item.title}

                  {item.isNew && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#bcee45] text-[10px] font-medium text-[#161616] shadow-lg shadow-[#bcee45]/20">
                      <Sparkles className="h-3 w-3" />
                    </span>
                  )}
                </Button>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto px-3 py-4">
        <div className="rounded-lg -bottom-30 bg-[#1a1a1a] border border-[#2a2a2a] p-4 shadow-lg relative overflow-hidden group">
          {/* Animated glow effect */}
          <div className="absolute  -inset-[50px] bg-[radial-gradient(circle_at_50%_120%,rgba(188,238,69,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <h4 className="font-medium text-sm mb-2 text-white">Upgrade to Pro</h4>
          <p className="text-xs text-gray-400 mb-3">
            Unlock advanced features and increase usage limits
          </p>
          <Button size="sm" className="w-full bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium relative overflow-hidden group">
            <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <Sparkles className="mr-2 h-4 w-4 relative z-10" />
            <span className="relative z-10">Upgrade</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
