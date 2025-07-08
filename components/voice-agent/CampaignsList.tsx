
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, BarChart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { getCampaigns } from "@/actions/voice-agent/getCampaigns";

export function CampaignsList() {
const [campaigns, setCampaigns] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
fetchCampaigns();
}, []);

const fetchCampaigns = async () => {
setIsLoading(true);
try {
const result = await getCampaigns();
if (result.success) {
setCampaigns(result.data);
} else {
toast.error(result.error || "Failed to load campaigns");
}
} catch (error) {
toast.error("Failed to load campaigns");
console.error("Error loading campaigns:", error);
} finally {
setIsLoading(false);
}
};

const getStatusBadge = (status: string) => {
switch (status) {
case "RUNNING":
return <Badge className="bg-green-500">Running</Badge>;
case "COMPLETED":
return <Badge className="bg-blue-500">Completed</Badge>;
case "FAILED":
return <Badge className="bg-red-500">Failed</Badge>;
case "PENDING":
return <Badge className="bg-yellow-500">Pending</Badge>;
case "PAUSED":
return <Badge className="bg-gray-500">Paused</Badge>;
default:
return <Badge className="bg-gray-500">{status}</Badge>;
}
};

return (
<div className="space-y-4">
<h2 className="text-xl font-bold">Recent Campaigns</h2>

{isLoading ? (
<div className="flex justify-center items-center h-32">
<Loader2 className="h-6 w-6 animate-spin text-primary" />
</div>
) : campaigns.length > 0 ? (
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{campaigns.map((campaign: any) => (
  <Card key={campaign.id} className="overflow-hidden border border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg text-white">{campaign.name}</CardTitle>
        {getStatusBadge(campaign.status)}
      </div>
    </CardHeader>
    
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Assistant:</span>
          <span className="text-white">{campaign.voiceAssistant.name}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Started:</span>
          <span className="text-white">{campaign.startDate ? formatDistanceToNow(new Date(campaign.startDate), { addSuffix: true }) : 'Not started'}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Status:</span>
          <div className="flex items-center space-x-2">
            <span className="text-white">{campaign.completedContacts} / {campaign.totalContacts} completed</span>
            {campaign.failedContacts > 0 && (
              <span className="text-red-500">({campaign.failedContacts} failed)</span>
            )}
          </div>
        </div>
        
        {campaign.logs && campaign.logs.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-1">Recent activity:</p>
            {campaign.logs.slice(0, 2).map((log: any) => (
              <p key={log.id} className="text-xs">
                <span className={`font-mono ${log.level === 'ERROR' ? 'text-red-500' : 'text-gray-400'}`}>
                  {new Date(log.timestamp).toLocaleTimeString()} -
                </span>{' '}
                <span className="text-gray-300">{log.message}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
))}
</div>
) : (
<div className="flex flex-col items-center justify-center h-32 border border-dashed border-[#323232] rounded-lg">
<Phone className="h-8 w-8 text-gray-400 mb-2" />
<p className="text-white">No campaigns yet</p>
<p className="text-sm text-gray-400">Create an assistant and start a campaign</p>
</div>
)}
</div>
);
}
