
// =========================================================
// ASSISTANT CARD - components/voice-agent/AssistantCard.tsx
// =========================================================

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Phone, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { startCampaign } from "@/actions/voice-agent/startCampaign";
import { formatDistanceToNow } from "date-fns";

interface AssistantCardProps {
assistant: {
id: string;
name: string;
voice: string;
language: string;
createdAt: Date;
knowledgeBase?: {
id: string;
name: string;
}[];
};
}

export function AssistantCard({ assistant }: AssistantCardProps) {
const [isStarting, setIsStarting] = useState(false);
const [campaignStarted, setCampaignStarted] = useState(false);

const handleStartCampaign = async () => {
setIsStarting(true);
try {
const result = await startCampaign(assistant.id);

if (result.success) {
toast.success("Campaign started successfully!");
setCampaignStarted(true);
} else {
throw new Error(result.error || "Failed to start campaign");
}
} catch (error) {
toast.error(error instanceof Error ? error.message : "Failed to start campaign");
} finally {
setIsStarting(false);
}
};

// Helper function to get readable voice name
const getVoiceName = (voiceId: string) => {
const knownVoices: Record<string, string> = {
"91fa9bcf-93c8-467c-8b29-973720e3f167": "Mark",
"terrence": "Terrence",
"lily": "Lily"
};
return knownVoices[voiceId] || voiceId;
};

return (
<Card className="overflow-hidden group relative border border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl">
<div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>

<CardHeader className="pb-2">
<div className="flex justify-between items-start">
<CardTitle className="text-white">{assistant.name}</CardTitle>
<Bot className="h-5 w-5 text-[#bcee45]" />
</div>
</CardHeader>

<CardContent>
<div className="space-y-4">
<div className="flex flex-wrap gap-2">
  <Badge variant="outline" className="bg-[#232323] text-gray-300 border-[#323232]">
    Voice: {getVoiceName(assistant.voice)}
  </Badge>
  <Badge variant="outline" className="bg-[#232323] text-gray-300 border-[#323232]">
    {assistant.language}
  </Badge>
  <Badge variant="outline" className="bg-[#232323] text-gray-300 border-[#323232]">
    Created {formatDistanceToNow(new Date(assistant.createdAt), { addSuffix: true })}
  </Badge>
</div>

<div className="space-y-2">
  <p className="text-sm text-gray-400">
    {assistant.knowledgeBase && assistant.knowledgeBase.length > 0 
      ? `${assistant.knowledgeBase.length} document${assistant.knowledgeBase.length === 1 ? '' : 's'} uploaded`
      : "No documents uploaded"}
  </p>
  
  <Button
    onClick={handleStartCampaign}
    disabled={isStarting || campaignStarted || !assistant.knowledgeBase || assistant.knowledgeBase.length === 0}
    className={`w-full ${
      campaignStarted 
        ? "bg-green-600 hover:bg-green-700" 
        : "bg-[#bcee45] hover:bg-[#dcff65] text-[#161616]"
    }`}
  >
    {isStarting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Starting Campaign...
      </>
    ) : campaignStarted ? (
      <>
        <Check className="mr-2 h-4 w-4" />
        Campaign Started
      </>
    ) : (
      <>
        <Phone className="mr-2 h-4 w-4" />
        Start Campaign
      </>
    )}
  </Button>
</div>
</div>
</CardContent>
</Card>
);
}
