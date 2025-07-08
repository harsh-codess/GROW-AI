// components/dashboard/quick-actions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Image, MessageSquare, Phone, FileText } from "lucide-react";

export function QuickActions() {
  const router = useRouter();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2"
        onClick={() => router.push("/dashboard/photoshoot")}
      >
        <Image className="h-6 w-6" />
        <span>Create Product Images</span>
      </Button>
      
      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2"
        onClick={() => router.push("/dashboard/chat")}
      >
        <MessageSquare className="h-6 w-6" />
        <span>Marketing Assistant</span>
      </Button>
      
      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2"
        onClick={() => router.push("/dashboard/voice")}
      >
        <Phone className="h-6 w-6" />
        <span>Set Up Voice Agent</span>
      </Button>
      
      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2"
        onClick={() => router.push("/dashboard/content")}
      >
        <FileText className="h-6 w-6" />
        <span>Generate Content</span>
      </Button>
    </div>
  );
}