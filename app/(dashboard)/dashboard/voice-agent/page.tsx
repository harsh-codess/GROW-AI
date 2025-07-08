"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Phone, History, Bot } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssistantForm } from "@/components/voice-agent/AssistantForm";
import { AssistantCard } from "@/components/voice-agent/AssistantCard";
import { CampaignsList } from "@/components/voice-agent/CampaignsList";
import { CallHistoryTable } from "@/components/voice-agent/CallHistoryTable";
import { getAssistants } from "@/actions/voice-agent/getAssistants";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function VoiceAgentPage() {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("assistants");

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    setIsLoading(true);
    try {
      const result = await getAssistants();
      if (result.success) {
        setAssistants(result.data);
      } else {
        toast.error(result.error || "Failed to load assistants");
      }
    } catch (error) {
      toast.error("Failed to load assistants");
      console.error("Error loading assistants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setIsDialogOpen(false);
    fetchAssistants();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Voice Agent</h1>
          <p className="text-gray-400">Create AI assistants that can make phone calls to your customers</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616]">
              <Plus className="mr-2 h-4 w-4" />
              Create Assistant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border border-[#323232]">
            <AssistantForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
    
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Assistants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{assistants.length}</div>
            <p className="text-sm text-gray-400">AI voice agents created</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-sm text-gray-400">Currently in progress</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-sm text-gray-400">Made with your assistants</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6  text-[#bcee45]">
        <TabsList className="bg-[#232323]  text-[#bcee45]  border border-[#323232]">
          <TabsTrigger value="assistants" className="flex  text-[#bcee45] items-center data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
            <Bot className="mr-2 h-4 w-4" />
            Assistants
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex  text-[#bcee45] items-center data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
            <Phone className="mr-2 h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="history" className="flex  text-[#bcee45] items-center data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
            <History className="mr-2 h-4 w-4" />
            Call History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assistants">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#bcee45]" />
            </div>
          ) : assistants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assistants.map((assistant) => (
                <AssistantCard 
                  key={assistant.id} 
                  assistant={assistant} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#323232] rounded-xl p-8">
              <Bot className="h-12 w-12 text-[#bcee45] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Voice Assistants Yet</h3>
              <p className="text-gray-400 text-center max-w-md mb-6">
                Create your first AI voice assistant to start making automated calls to your customers.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Assistant
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="campaigns">
          <CampaignsList />
        </TabsContent>
        
        <TabsContent value="history">
          <CallHistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

