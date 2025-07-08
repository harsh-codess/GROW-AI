"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnimation } from "framer-motion";
import { Terminal, Zap, Code, BrainCircuit, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { templates, Template } from "./EmailTemplates";

interface EmailConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  csvData: {
    headers: string[];
    data: Record<string, string>[];
    totalRows: number;
  };
  onCampaignStart: (config: {
    tone: string;
    emailType: string;
    context: string;
    template: string;
  }) => void;
}

export function EmailConfigDialog({
  isOpen,
  onClose,
  csvData,
  onCampaignStart,
}: EmailConfigDialogProps) {
  const [tone, setTone] = useState("friendly");
  const [emailType, setEmailType] = useState("generic");
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();
  const animationRef = useRef<null | { cancel: () => void }>(null);

  // Load selected template from localStorage on component mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem('selectedEmailTemplate');
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
    
    // Animate the glow effect with proper cleanup
    const animateGlow = async () => {
      const animation = glowControls.start({
        opacity: [0.3, 0.5, 0.3],
        transition: { duration: 3, ease: "easeInOut", repeat: Infinity }
      });
      
      // Store animation reference for cleanup
      // animationRef.current = animation;
    };
    
    animateGlow();
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [glowControls]);

  const handleSubmit = async () => {
    if (!selectedTemplate) {
      toast.error("Please select an email template first", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
      return;
    }

    const template = templates.find((t: Template) => t.id === selectedTemplate);
    if (!template) {
      toast.error("Invalid template selected", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      await onCampaignStart({
        tone,
        emailType,
        context,
        template: template.preview
      });
      onClose();
    } catch (error) {
      console.error("Failed to start campaign:", error);
      toast.error("Failed to start campaign", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] w-full max-h-[85vh] border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 text-gray-200 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-white flex items-center">
            <Terminal className="mr-2 h-5 w-5 text-[#bcee45]" />
            Email Configuration
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Email Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-[#232323] border-[#323232] text-gray-300 h-9 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent w-full">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#323232] text-gray-300">
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Email Type</Label>
              <RadioGroup value={emailType} onValueChange={setEmailType} className="border border-[#323232] rounded-lg p-3 bg-[#232323]/50">
                <div className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-[#232323] transition-colors">
                  <RadioGroupItem value="generic" id="generic" className="border-[#bcee45] text-[#bcee45]" />
                  <Label htmlFor="generic" className="text-gray-300 cursor-pointer">Generic (Same email for everyone)</Label>
                </div>
                <div className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-[#232323] transition-colors">
                  <RadioGroupItem value="personalized" id="personalized" className="border-[#bcee45] text-[#bcee45]" />
                  <Label htmlFor="personalized" className="text-gray-300 cursor-pointer">Personalized (Custom for each person)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Email Context</Label>
              <Textarea
                placeholder="Enter the context for your email campaign..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[80px] max-h-[120px] bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30 placeholder:text-gray-500 w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">CSV Preview</Label>
                <div className="bg-[#232323] px-2 py-1 text-xs text-[#bcee45] rounded flex items-center">
                  <Code className="h-3 w-3 mr-1" />
                  {csvData.totalRows} records
                </div>
              </div>
              <div className="max-h-[150px] overflow-auto rounded-lg border border-[#323232] bg-[#232323]/50">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-[#1e1e1e] border-b border-[#323232] sticky top-0">
                      <tr>
                        {csvData.headers.map((header) => (
                          <th key={header} className="px-4 py-2">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#323232]">
                      {csvData.data.slice(0, 5).map((row, index) => (
                        <tr key={index} className="bg-[#232323]/50 hover:bg-[#232323] transition-colors">
                          {csvData.headers.map((header) => (
                            <td key={header} className="px-4 py-2 text-gray-300">{row[header]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvData.totalRows > 5 && (
                  <div className="text-xs text-gray-500 p-2 bg-[#1e1e1e] border-t border-[#323232]">
                    Showing 5 of {csvData.totalRows} rows
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start gap-3">
                <BrainCircuit className="h-4 w-4 text-[#bcee45] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300 mb-1">AI Enhancement</p>
                  <p className="text-xs text-gray-400">
                    Our neural engine will analyze your contacts and generate personalized messages based on your selected tone and context.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#323232] mt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-[#323232] text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
          >
            <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center">
              {isLoading ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 animate-pulse" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  <span>Start Campaign</span>
                </>
              )}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}