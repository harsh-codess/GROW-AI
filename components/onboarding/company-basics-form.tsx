// components/onboarding/company-basics-form.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Building2, TrendingUp, Briefcase, Terminal, Code } from "lucide-react";

interface CompanyBasicsData {
  name: string;
  website: string;
  industry: string;
  size: string;
  fundingStage: string;
}

interface CompanyBasicsFormProps {
  data: CompanyBasicsData;
  updateData: (fields: Partial<CompanyBasicsData>) => void;
}

export function CompanyBasicsForm({ data, updateData }: CompanyBasicsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="company-name" className="text-sm font-medium flex items-center text-gray-200">
          <Terminal className="h-4 w-4 mr-2 text-[#bcee45]" />
          Entity Name*
        </Label>
        <Input 
          id="company-name" 
          placeholder="Acme Inc." 
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
          required
        />
        <p className="text-xs text-gray-500">Used throughout your AI-generated content</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website" className="text-sm font-medium flex items-center text-gray-200">
          <Globe className="h-4 w-4 mr-2 text-[#bcee45]" />
          Web Domain
        </Label>
        <Input 
          id="website" 
          placeholder="https://yourcompany.com" 
          value={data.website}
          onChange={(e) => updateData({ website: e.target.value })}
          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="industry" className="text-sm font-medium flex items-center text-gray-200">
          <Briefcase className="h-4 w-4 mr-2 text-[#bcee45]" />
          Market Sector*
        </Label>
        <Select 
          value={data.industry} 
          onValueChange={(value) => updateData({ industry: value })}
          required
        >
          <SelectTrigger 
            id="industry" 
            className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
          >
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#323232] text-white">
            <SelectItem value="saas" className="focus:bg-[#232323] focus:text-[#bcee45]">SaaS</SelectItem>
            <SelectItem value="ecommerce" className="focus:bg-[#232323] focus:text-[#bcee45]">E-commerce</SelectItem>
            <SelectItem value="fintech" className="focus:bg-[#232323] focus:text-[#bcee45]">Fintech</SelectItem>
            <SelectItem value="healthcare" className="focus:bg-[#232323] focus:text-[#bcee45]">Healthcare</SelectItem>
            <SelectItem value="education" className="focus:bg-[#232323] focus:text-[#bcee45]">Education</SelectItem>
            <SelectItem value="retail" className="focus:bg-[#232323] focus:text-[#bcee45]">Retail</SelectItem>
            <SelectItem value="food" className="focus:bg-[#232323] focus:text-[#bcee45]">Food & Beverage</SelectItem>
            <SelectItem value="travel" className="focus:bg-[#232323] focus:text-[#bcee45]">Travel & Hospitality</SelectItem>
            <SelectItem value="real-estate" className="focus:bg-[#232323] focus:text-[#bcee45]">Real Estate</SelectItem>
            <SelectItem value="other" className="focus:bg-[#232323] focus:text-[#bcee45]">Other</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">Helps our AI generate sector-specific content</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company-size" className="text-sm font-medium flex items-center text-gray-200">
          <Building2 className="h-4 w-4 mr-2 text-[#bcee45]" />
          Entity Size
        </Label>
        <Select 
          value={data.size} 
          onValueChange={(value) => updateData({ size: value })}
        >
          <SelectTrigger 
            id="company-size" 
            className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
          >
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#323232] text-white">
            <SelectItem value="1-10" className="focus:bg-[#232323] focus:text-[#bcee45]">1-10 employees</SelectItem>
            <SelectItem value="11-50" className="focus:bg-[#232323] focus:text-[#bcee45]">11-50 employees</SelectItem>
            <SelectItem value="51-200" className="focus:bg-[#232323] focus:text-[#bcee45]">51-200 employees</SelectItem>
            <SelectItem value="201-500" className="focus:bg-[#232323] focus:text-[#bcee45]">201-500 employees</SelectItem>
            <SelectItem value="500+" className="focus:bg-[#232323] focus:text-[#bcee45]">500+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="funding-stage" className="text-sm font-medium flex items-center text-gray-200">
          <TrendingUp className="h-4 w-4 mr-2 text-[#bcee45]" />
          Resource Level
        </Label>
        <Select 
          value={data.fundingStage} 
          onValueChange={(value) => updateData({ fundingStage: value })}
        >
          <SelectTrigger 
            id="funding-stage" 
            className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
          >
            <SelectValue placeholder="Select funding stage" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#323232] text-white">
            <SelectItem value="pre-seed" className="focus:bg-[#232323] focus:text-[#bcee45]">Pre-seed</SelectItem>
            <SelectItem value="seed" className="focus:bg-[#232323] focus:text-[#bcee45]">Seed</SelectItem>
            <SelectItem value="series-a" className="focus:bg-[#232323] focus:text-[#bcee45]">Series A</SelectItem>
            <SelectItem value="series-b" className="focus:bg-[#232323] focus:text-[#bcee45]">Series B</SelectItem>
            <SelectItem value="series-c+" className="focus:bg-[#232323] focus:text-[#bcee45]">Series C+</SelectItem>
            <SelectItem value="bootstrapped" className="focus:bg-[#232323] focus:text-[#bcee45]">Bootstrapped</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Cyberpunk detail element */}
      <div className="mt-2 p-4 bg-[#232323]/80 border border-[#323232] rounded-lg relative overflow-hidden">
        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent"></div>
        <div className="flex items-center">
          <Code className="h-4 w-4 text-[#bcee45] mr-2" />
          <p className="text-xs text-gray-400">
            System will generate optimal marketing parameters based on entity configuration
          </p>
        </div>
      </div>
    </div>
  );
}