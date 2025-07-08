"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Bot, Sparkles } from "lucide-react";
import { createAssistant } from "@/actions/voice-agent/createAssistant";
import { uploadKnowledgeBase } from "@/actions/voice-agent/uploadKnowledgeBase";
import { FileUpload } from "../ui/FileUpload";
import { availableLanguages, availableVoices } from "@/app/lib/voice-agent/constants";
import { refinePrompt } from "@/actions/systemPrompt/RefinePrompt";


export function AssistantForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);


  const [formData, setFormData] = useState({
    name: "",
    systemPrompt: "",
    voice: "91fa9bcf-93c8-467c-8b29-973720e3f167", // Default voice (Mark)
    language: "english", // Default language
    model: "fixie-ai/ultravox", // Default model
    speakFirst: "AGENT" as const,
    temprature: 0.3,
    maxCallDuration: 180
  });

  // Validate individual field
  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'name':
        return value.trim() ? null : "Assistant name is required";
        case 'systemPrompt':
          return value.trim() ? null : "System prompt is required";
          case 'temprature':
            return (value >= 0 && value <= 1) ? null : "Temperature must be between 0 and 1";
            case 'maxCallDuration':
              return (value >= 30 && value <= 600) ? null : "Call duration must be between 30 and 600 seconds";
              default:
                return null;
              }
            };

            const handleInputChange = (field: string, value: any) => {
              setFormData(prev => ({ ...prev, [field]: value }));

              // Validate field on change
              const error = validateField(field, value);
              setErrors(prev => ({ ...prev, [field]: error || "" }));
            };

            const validateForm = (): boolean => {
              const newErrors: Record<string, string> = {};
              let isValid = true;

              // Validate each field
              Object.entries(formData).forEach(([field, value]) => {
                const error = validateField(field, value);
                if (error) {
                  newErrors[field] = error;
                  isValid = false;
                }
              });

    // Validate file upload
    if (knowledgeBaseFiles.length === 0) {
      setFileUploadError("Please upload at least one document with phone numbers");
      isValid = false;
    } else {
      setFileUploadError(null);
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create assistant
      const result = await createAssistant(formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to create assistant");
      }

      // Upload knowledge base files
      const knowledgeBaseResult = await uploadKnowledgeBase(knowledgeBaseFiles, result.data.id);

      if (!knowledgeBaseResult.success) {
        throw new Error(knowledgeBaseResult.error || "Failed to upload knowledge base");
      }

      toast.success("Assistant created successfully!");

      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setFormData({
        name: "",
        systemPrompt: "",
        voice: "91fa9bcf-93c8-467c-8b29-973720e3f167",
        language: "english",
        model: "fixie-ai/ultravox",
        speakFirst: "AGENT",
        temprature: 0.3,
        maxCallDuration: 180
      });
      setKnowledgeBaseFiles([]);
      setErrors({});
      setFileUploadError(null);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create assistant");
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleRefinePrompt() {
    setIsRefining(true);
    try {
      const refinedPrompt = await refinePrompt(formData.systemPrompt);
      if (!refinedPrompt) {
        toast.error("Error while refining prompt");
        return;
      }
      handleInputChange("systemPrompt", refinedPrompt);
    } catch (error) {
      toast.error("Failed to refine prompt");
    } finally {
      setIsRefining(false);
    }
  }

  return (
    <Card className="w-full border border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all">
      <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>

      <CardHeader className="pb-2 flex justify-between items-start border-b border-[#323232]">
        <CardTitle className="text-white">Create Voice Assistant</CardTitle>
        <Bot className="h-5 w-5 text-[#bcee45]" />
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className={`text-white ${errors.name ? "text-red-400" : ""}`}>
                Assistant Name*
              </Label>
              <Input
                id="name"
                placeholder="e.g. Sales Assistant"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isSubmitting}
                className={`bg-[#232323] border-[#323232] text-white placeholder:text-gray-500 focus:border-[#bcee45] focus:ring-[#bcee45]/20 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice" className="text-white">Voice</Label>
              <Select
                value={formData.voice}
                onValueChange={(value) => handleInputChange("voice", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="voice" className="bg-[#232323] border-[#323232] text-white focus:ring-[#bcee45]/20 focus:border-[#bcee45]">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1c] border-[#323232] text-white">
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.voiceId} value={voice.voiceId} className="focus:bg-[#bcee45]/20 focus:text-white data-[highlighted]:bg-[#bcee45]/10 data-[highlighted]:text-white">
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-white">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleInputChange("language", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="language" className="bg-[#232323] border-[#323232] text-white focus:ring-[#bcee45]/20 focus:border-[#bcee45]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1c] border-[#323232] text-white">
                  {availableLanguages.map((language) => (
                    <SelectItem key={language.id} value={language.id} className="focus:bg-[#bcee45]/20 focus:text-white data-[highlighted]:bg-[#bcee45]/10 data-[highlighted]:text-white">
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="speakFirst" className="text-white">Who Speaks First</Label>
              <Select
                value={formData.speakFirst}
                onValueChange={(value) => handleInputChange("speakFirst", value as "AGENT" | "CLIENT")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="speakFirst" className="bg-[#232323] border-[#323232] text-white focus:ring-[#bcee45]/20 focus:border-[#bcee45]">
                  <SelectValue placeholder="Select who speaks first" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1c] border-[#323232] text-white">
                  <SelectItem value="AGENT" className="focus:bg-[#bcee45]/20 focus:text-white data-[highlighted]:bg-[#bcee45]/10 data-[highlighted]:text-white">Assistant</SelectItem>
                  <SelectItem value="CLIENT" className="focus:bg-[#bcee45]/20 focus:text-white data-[highlighted]:bg-[#bcee45]/10 data-[highlighted]:text-white">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="temprature" className={`text-white ${errors.temprature ? "text-red-400" : ""}`}>
                  Temperature (0-1)
                </Label>
                <Input
                  id="temprature"
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={formData.temprature}
                  onChange={(e) => handleInputChange("temprature", parseFloat(e.target.value))}
                  disabled={isSubmitting}
                  className={`bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20 ${errors.temprature ? "border-red-500" : ""}`}
                />
                {errors.temprature && (
                  <p className="text-xs text-red-400">{errors.temprature}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="maxCallDuration"
                  className={`text-white ${errors.maxCallDuration ? "text-red-400" : ""}`}
                >
                  Maximum Call Duration (seconds)
                </Label>
                <Input
                  id="maxCallDuration"
                  type="number"
                  min={30}
                  max={600}
                  value={formData.maxCallDuration}
                  onChange={(e) => handleInputChange("maxCallDuration", parseInt(e.target.value))}
                  disabled={isSubmitting}
                  className={`bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20 ${errors.maxCallDuration ? "border-red-500" : ""}`}
                />
                {errors.maxCallDuration && (
                  <p className="text-xs text-red-400">{errors.maxCallDuration}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="systemPrompt"
              className={`text-white ${errors.systemPrompt ? "text-red-400" : ""}`}
            >
              System Prompt*
            </Label>
            <Textarea
              id="systemPrompt"
              placeholder="How should your assistant behave? What information should it provide?"
              className={`min-h-32 max-h-96 bg-[#232323] border-[#323232] text-white placeholder:text-gray-500 focus:border-[#bcee45] focus:ring-[#bcee45]/20 ${errors.systemPrompt ? "border-red-500" : ""}`}
              value={formData.systemPrompt}
              onChange={(e) => handleInputChange("systemPrompt", e.target.value)}
              disabled={isSubmitting}
              style={{ overflowY: 'auto', resize: 'vertical' }}
            />
            {errors.systemPrompt ? (
              <p className="text-xs text-red-400">{errors.systemPrompt}</p>
            ) : (
              <div className="flex gap-2 p-2">
                <div
                  className="cursor-pointer hover:bg-gray-600 p-2 rounded-lg"
                  onClick={handleRefinePrompt}
                  style={{ cursor: isRefining ? 'not-allowed' : 'pointer' }}
                >
                  {isRefining ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin"/>
                  ) : (
                    <Sparkles className="h-5 text-white"/>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  This prompt guides how your assistant will speak with customers.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className={`text-white ${fileUploadError ? "text-red-400" : ""}`}>
              Upload Documents with Phone Numbers*
            </Label>
            <div className="border-2 border-dashed border-[#323232] hover:border-[#bcee45]/50 transition-colors rounded-lg p-6">
              <FileUpload
                onFilesSelected={files => {
                  setKnowledgeBaseFiles(files);
                  if (files.length > 0) setFileUploadError(null);
                }}
                accept=".pdf,.docx,.csv"
                multiple={true}
                loading={isSubmitting}
              />
            </div>
            {fileUploadError ? (
              <p className="text-xs text-red-400">{fileUploadError}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Upload PDF, DOCX, or CSV files containing phone numbers and context for the assistant.
                The system will automatically extract numbers to call.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Assistant...
                </>
              ) : (
                "Create Assistant"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
