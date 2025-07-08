
// =========================================================
// CALL HISTORY TABLE - components/voice-agent/CallHistoryTable.tsx
// =========================================================

"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Loader2, 
  MessageSquare,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getCallHistory } from "@/actions/voice-agent/getCallHistory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Call {
  id: string;
  assistantName: string;
  campaignName: string;
  customerName: string | null;
  customerNumber: string;
  callAnswered: boolean;
  callStartedAt: Date | null;
  callEndedAt: Date | null;
  callDuration: number | null;
  callSummary: string | null;
  transcript: string | null;
  callSid: string | null;
}

export function CallHistoryTable() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchCallHistory();
  }, []);
  
  const fetchCallHistory = async () => {
    setIsLoading(true);
    try {
      const result = await getCallHistory();
      if (result.success) {
        setCalls(result.data);
      } else {
        toast.error(result.error || "Failed to load call history");
      }
    } catch (error) {
      toast.error("Failed to load call history");
      console.error("Error loading call history:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewTranscript = (call: Call) => {
    setSelectedCall(call);
    setIsDialogOpen(true);
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Call History</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-[#bcee45]" />
        </div>
      ) : calls.length > 0 ? (
        <div className="border border-[#323232] rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#323232]">
                <TableHead className="text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-300">Assistant</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">When</TableHead>
                <TableHead className="text-gray-300">Duration</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.id} className="border-b border-[#323232]">
                  <TableCell>
                    <div className="font-medium text-white">
                      {call.customerName || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {call.customerNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-white">{call.assistantName}</div>
                    <div className="text-sm text-gray-400">{call.campaignName}</div>
                  </TableCell>
                  <TableCell>
                    {call.callAnswered ? (
                      <Badge className="bg-green-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Answered
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Not Answered
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {call.callStartedAt ? (
                      <>
                        <div className="text-white">{format(new Date(call.callStartedAt), 'MMM d, yyyy')}</div>
                        <div className="text-sm text-gray-400">{format(new Date(call.callStartedAt), 'h:mm a')}</div>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-white">
                    {call.callDuration ? formatDuration(call.callDuration) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTranscript(call)}
                      disabled={!call.transcript}
                      className="border-[#bcee45] bg-[#1a1a1a] text-[#bcee45] hover:bg-[#bcee45]/10"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Transcript
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 border border-dashed border-[#323232] rounded-lg">
          <Phone className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-white">No call history yet</p>
          <p className="text-sm text-gray-400">Start a campaign to make calls</p>
        </div>
      )}
      
      {selectedCall && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#1a1a1a] border border-[#323232]">
            <DialogHeader>
              <DialogTitle className="text-white">Call Transcript</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="font-medium text-white">{selectedCall.customerName || 'Unknown'}</p>
                  <p className="text-sm text-gray-300">{selectedCall.customerNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Call Details</p>
                  <p className="font-medium text-white">
                    {selectedCall.callStartedAt ? format(new Date(selectedCall.callStartedAt), 'PPpp') : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-300">
                    Duration: {selectedCall.callDuration ? formatDuration(selectedCall.callDuration) : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-[#323232] pt-4">
                <h3 className="font-medium text-white mb-4">Conversation</h3>
                
                {selectedCall.transcript ? (
                  <div className="space-y-4">
                    {JSON.parse(selectedCall.transcript).map((message: any, index: number) => (
                      <div 
                        key={index}
                        className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-2`}
                      >
                        <div 
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            message.role === 'assistant' 
                              ? 'bg-[#232323] text-white' 
                              : 'bg-[#bcee45]/10 text-[#bcee45]'
                          }`}
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            {message.role === 'assistant' ? selectedCall.assistantName : 'Customer'}
                          </div>
                          <p>{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No transcript available for this call.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
