// components/onboarding/brand-profile-form.tsx
"use client";

import { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Image, Palette, MessageSquare, Users, Terminal, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface BrandProfileData {
  logo: File | null;
  primaryColor: string;
  missionStatement: string;
  targetAudience: string;
}

interface BrandProfileFormProps {
  data: BrandProfileData;
  updateData: (fields: Partial<BrandProfileData>) => void;
}

export function BrandProfileForm({ data, updateData }: BrandProfileFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(
    data.logo ? URL.createObjectURL(data.logo) : null
  );

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    
    // Store the file
    updateData({ logo: file });
  };

  const removeLogo = () => {
    setLogoPreview(null);
    updateData({ logo: null });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center text-gray-200">
          <Image className="h-4 w-4 mr-2 text-[#bcee45]" />
          Interface Icon
        </Label>
        <div className="flex items-center justify-center border-2 border-dashed border-[#323232] rounded-xl h-40 relative bg-[#232323]/50 hover:bg-[#232323] transition-colors">
          {logoPreview ? (
            <div className="relative w-full h-full p-2">
              <img 
                src={logoPreview} 
                alt="Company logo" 
                className="max-h-full max-w-full mx-auto object-contain"
              />
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-1 right-1 h-8 w-8 p-0 rounded-full bg-[#232323] hover:bg-red-900 border border-[#323232]" 
                onClick={removeLogo}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 rounded-full bg-[#bcee45]/20 mb-2">
                  <UploadCloud className="h-6 w-6 text-[#bcee45]" />
                </div>
                <span className="text-sm text-gray-300 font-medium">
                  Click to upload your icon
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </motion.div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleLogoChange}
              />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-500">Your icon will be used in AI-generated content</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="primary-color" className="text-sm font-medium flex items-center text-gray-200">
          <Palette className="h-4 w-4 mr-2 text-[#bcee45]" />
          System Color
        </Label>
        <div className="flex gap-3">
          <div 
            className="w-12 h-10 rounded-md border border-[#323232] cursor-pointer flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: data.primaryColor }}
          >
            <Input 
              id="primary-color" 
              type="color" 
              className="w-16 h-16 cursor-pointer opacity-0 absolute"
              value={data.primaryColor}
              onChange={(e) => updateData({ primaryColor: e.target.value })}
            />
          </div>
          <Input 
            type="text" 
            value={data.primaryColor}
            onChange={(e) => updateData({ primaryColor: e.target.value })}
            className="flex-1 bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
          />
        </div>
        <p className="text-xs text-gray-500">This color will be used in your AI-generated visuals</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mission-statement" className="text-sm font-medium flex items-center text-gray-200">
          <Terminal className="h-4 w-4 mr-2 text-[#bcee45]" />
          System Directive
        </Label>
        <Textarea 
          id="mission-statement" 
          placeholder="Describe your company's mission and vision" 
          rows={3}
          value={data.missionStatement}
          onChange={(e) => updateData({ missionStatement: e.target.value })}
          className="resize-none bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
        />
        <p className="text-xs text-gray-500">This helps our AI understand your core purpose</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="target-audience" className="text-sm font-medium flex items-center text-gray-200">
          <Users className="h-4 w-4 mr-2 text-[#bcee45]" />
          Target Demographic
        </Label>
        <Textarea 
          id="target-audience" 
          placeholder="Describe your target users/audience (e.g. age, interests, pain points)" 
          rows={3}
          value={data.targetAudience}
          onChange={(e) => updateData({ targetAudience: e.target.value })}
          className="resize-none bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
        />
        <p className="text-xs text-gray-500">AI will target content specifically for this audience</p>
      </div>
      
    
    </div>
  );
}