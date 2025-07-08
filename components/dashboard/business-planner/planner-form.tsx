"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Building2, Rocket, Users, Target, BarChart, DollarSign, BrainCircuit, Sparkles, Calendar, ChevronRight, Zap, Code } from "lucide-react";

// Form schema
const formSchema = z.object({
  // Basic Information
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
  businessDescription: z.string().min(10, { message: "Please provide a brief description" }),
  industry: z.string().min(2, { message: "Please select or enter your industry" }),
  stage: z.string(),
  location: z.string().min(2, { message: "Please enter your target location" }),
  
  // Product/Service
  productDescription: z.string().min(10, { message: "Please describe your product/service" }),
  keyFeatures: z.string().min(10, { message: "Please list key features and benefits" }),
  developmentStage: z.string(),
  
  // Market Analysis
  targetCustomer: z.string().min(10, { message: "Please describe your target customer" }),
  marketSize: z.string(),
  competitors: z.string(),
  uniqueSellingProposition: z.string().min(10, { message: "Please describe what makes you unique" }),
  
  // Financial Information
  fundingStatus: z.string(),
  revenueModel: z.string().min(5, { message: "Please describe your revenue model" }),
  initialBudget: z.string(),
  
  // Strategy & Goals
  shortTermGoals: z.string().min(10, { message: "Please describe your short-term goals" }),
  longTermVision: z.string().min(10, { message: "Please describe your long-term vision" }),
  marketingApproach: z.string().min(5, { message: "Please describe your marketing approach" }),
  timelineFocus: z.string(),
});

interface PlannerFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export function PlannerForm({ onSubmit }: PlannerFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [progress, setProgress] = useState(20);
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessDescription: "",
      industry: "",
      stage: "idea",
      location: "",
      productDescription: "",
      keyFeatures: "",
      developmentStage: "concept",
      targetCustomer: "",
      marketSize: "small",
      competitors: "",
      uniqueSellingProposition: "",
      fundingStatus: "bootstrap",
      revenueModel: "",
      initialBudget: "",
      shortTermGoals: "",
      longTermVision: "",
      marketingApproach: "",
      timelineFocus: "6months"
    }
  });
  
  // Calculate completion percentage
  const calculateProgress = () => {
    const values = form.getValues();
    const totalFields = Object.keys(formSchema.shape).length;
    const completedFields = Object.entries(values).filter(([_, value]) => value && value.length > 0).length;
    return Math.round((completedFields / totalFields) * 100);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setProgress(calculateProgress());
  };
  
  // Handle form submission
  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Business Plan Configuration</h3>
            <div className="flex items-center text-sm text-gray-400">
              <span>Completion:</span>
              <span className="ml-2 text-[#bcee45] font-medium">{progress}%</span>
            </div>
          </div>
          
          <Progress value={progress} className="h-1 bg-[#323232]" indicatorClassName="bg-[#bcee45]" />
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="bg-[#232323] border border-[#323232] p-1 grid grid-cols-5">
              <TabsTrigger value="basic" className="flex items-center justify-center text-white data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
                <Building2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Basics</span>
              </TabsTrigger>
              <TabsTrigger value="product" className="flex items-center justify-center text-white data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
                <Rocket className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Product</span>
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center justify-center  text-white data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
                <Target className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Market</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center justify-center text-white data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Financial</span>
              </TabsTrigger>
              <TabsTrigger value="strategy" className="flex items-center justify-center text-white data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Strategy</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-start gap-3">
                    <Code className="h-4 w-4 text-[#bcee45] mt-1" />
                    <div>
                      <p className="text-sm text-gray-300">Business Basics</p>
                      <p className="text-xs text-gray-400">
                        Start by defining the fundamental aspects of your business. This information helps establish the foundation of your strategic plan.
                      </p>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Business Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your business or product name" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Business Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe your business concept and mission" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20 min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Industry</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Technology, Healthcare, Retail" 
                            className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Target Location</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. North America, Global, San Francisco" 
                            className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Current Stage</FormLabel>
                      <FormControl>
                        <RadioGroup
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="idea"
                                id="idea"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="idea"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Idea Stage</div>
                              <div className="text-xs text-gray-400">Initial concept</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="pre-launch"
                                id="pre-launch"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="pre-launch"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Pre-Launch</div>
                              <div className="text-xs text-gray-400">In development</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="operating"
                                id="operating"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="operating"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Operating</div>
                              <div className="text-xs text-gray-400">Live with customers</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="scaling"
                                id="scaling"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="scaling"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Scaling</div>
                              <div className="text-xs text-gray-400">Growth phase</div>
                            </label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="button"
                  onClick={() => handleTabChange("product")}
                  className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center">
                    Next: Product Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </div>
            </TabsContent>
            
            {/* Product/Service */}
            <TabsContent value="product" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-start gap-3">
                    <Code className="h-4 w-4 text-[#bcee45] mt-1" />
                    <div>
                      <p className="text-sm text-gray-300">Product/Service Details</p>
                      <p className="text-xs text-gray-400">
                        Describe what you offer, its unique features, and current development status. This helps create targeted strategies for your specific offering.
                      </p>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Product/Service Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your product or service in detail" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20 min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="keyFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Key Features & Benefits</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List the main features and benefits of your product/service" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20 min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="developmentStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Development Stage</FormLabel>
                      <FormControl>
                        <RadioGroup
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="concept"
                                id="concept"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="concept"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Concept</div>
                              <div className="text-xs text-gray-400">Initial idea</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="prototype"
                                id="prototype"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="prototype"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Prototype</div>
                              <div className="text-xs text-gray-400">Working model</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="mvp"
                                id="mvp"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="mvp"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">MVP</div>
                              <div className="text-xs text-gray-400">Minimal viable product</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="launched"
                                id="launched"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="launched"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Launched</div>
                              <div className="text-xs text-gray-400">In market</div>
                            </label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  type="button"
                  onClick={() => handleTabChange("basic")}
                  variant="outline"
                  className="bg-[#232323] border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                >
                  Previous
                </Button>
                
                <Button 
                  type="button"
                  onClick={() => handleTabChange("market")}
                  className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center">
                    Next: Market Analysis
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </div>
            </TabsContent>
            
            {/* Market Analysis */}
            <TabsContent value="market" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-start gap-3">
                    <Code className="h-4 w-4 text-[#bcee45] mt-1" />
                    <div>
                      <p className="text-sm text-gray-300">Market Analysis</p>
                      <p className="text-xs text-gray-400">
                        Define your target market and competitive landscape. Understanding these elements helps position your business effectively.
                      </p>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="targetCustomer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Target Customer Profile</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your ideal customer (demographics, behaviors, needs)" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20 min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marketSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Estimated Market Size</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20">
                              <SelectValue placeholder="Select market size" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-[#323232] text-white">
                              <SelectItem value="small">Small (Under $1M)</SelectItem>
                              <SelectItem value="medium">Medium ($1M - $10M)</SelectItem>
                              <SelectItem value="large">Large ($10M - $100M)</SelectItem>
                              <SelectItem value="enterprise">Enterprise ($100M+)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="text-gray-500 text-xs">
                          Approximate size of your target market
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="competitors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Main Competitors</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List your primary competitors and their strengths/weaknesses" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="uniqueSellingProposition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Unique Selling Proposition</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What makes your business unique compared to competitors?" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20 min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  type="button"
                  onClick={() => handleTabChange("product")}
                  variant="outline"
                  className="bg-[#232323] border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                >
                  Previous
                </Button>
                
                <Button 
                  type="button"
                  onClick={() => handleTabChange("financial")}
                  className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center">
                    Next: Financial Info
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </div>
            </TabsContent>
            
            {/* Financial Information */}
            <TabsContent value="financial" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-start gap-3">
                    <Code className="h-4 w-4 text-[#bcee45] mt-1" />
                    <div>
                      <p className="text-sm text-gray-300">Financial Information</p>
                      <p className="text-xs text-gray-400">
                        Outline your financial approach and resources. This helps create realistic and achievable financial projections.
                      </p>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="fundingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Current Funding Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="bootstrap"
                                id="bootstrap"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="bootstrap"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Bootstrapped</div>
                              <div className="text-xs text-gray-400">Self-funded</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="pre-seed"
                                id="pre-seed"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="pre-seed"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Pre-seed</div>
                              <div className="text-xs text-gray-400">Friends & family</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="seed"
                                id="seed"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="seed"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Seed</div>
                              <div className="text-xs text-gray-400">Angel/VC funding</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="series"
                                id="series"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="series"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">Series Funding</div>
                              <div className="text-xs text-gray-400">Series A or beyond</div>
                            </label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="revenueModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Revenue Model</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe how your business will generate revenue" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="initialBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Initial Budget</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Estimated startup costs or current monthly budget" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  type="button"
                  onClick={() => handleTabChange("market")}
                  variant="outline"
                  className="bg-[#232323] border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                >
                  Previous
                </Button>
                
                <Button 
                  type="button"
                  onClick={() => handleTabChange("strategy")}
                  className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center">
                    Next: Strategy & Goals
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </div>
            </TabsContent>
            
            {/* Strategy & Goals */}
            <TabsContent value="strategy" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-start gap-3">
                    <Code className="h-4 w-4 text-[#bcee45] mt-1" />
                    <div>
                      <p className="text-sm text-gray-300">Strategy & Goals</p>
                      <p className="text-xs text-gray-400">
                        Define your short and long-term objectives. This information helps create a clear roadmap with meaningful milestones.
                      </p>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="shortTermGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Short-Term Goals (6-12 months)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What do you aim to achieve in the next 6-12 months?" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20 min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="longTermVision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Long-Term Vision (2-5 years)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Where do you see your business in 2-5 years?" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20 min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="marketingApproach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Marketing Approach</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How do you plan to reach and engage your customers?" 
                          className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timelineFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Timeline Focus</FormLabel>
                      <FormControl>
                        <RadioGroup
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-3 gap-4"
                        >
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="6months"
                                id="6months"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="6months"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">6 Months</div>
                              <div className="text-xs text-gray-400">Short-term plan</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="1year"
                                id="1year"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="1year"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">1 Year</div>
                              <div className="text-xs text-gray-400">Annual plan</div>
                            </label>
                          </FormItem>
                          
                          <FormItem className="flex flex-col items-center space-y-3 h-24 relative">
                            <FormControl>
                              <RadioGroupItem
                                value="3years"
                                id="3years"
                                className="peer sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor="3years"
                              className="flex h-full w-full flex-col gap-2 rounded-md border border-[#323232] bg-[#232323] p-4 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 peer-checked:bg-[#bcee45] border-[#bcee45] text-white peer-checked:border-[#bcee45] peer-checked:text-[#161616] cursor-pointer transition-all"
                            >
                              <div className="text-sm font-semibold">3 Years</div>
                              <div className="text-xs text-gray-400">Long-term vision</div>
                            </label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  type="button"
                  onClick={() => handleTabChange("financial")}
                  variant="outline"
                  className="bg-[#232323] border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                >
                  Previous
                </Button>
                
                <Button 
                  type="submit"
                  className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center">
                    Generate Business Plan
                    <Sparkles className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </form>
    </Form>
  );
}