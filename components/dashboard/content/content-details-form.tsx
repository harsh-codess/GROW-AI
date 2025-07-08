"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Sparkles, 
  Target, 
  Users, 
  Palette, 
  Camera, 
  Upload,
  AlignLeft,
  Pencil,
  Layout,
  Terminal,
  BrainCircuit,
  Code,
  Zap,
  Hash,
  ImageIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ContentDetailsFormProps {
  contentType: string;
  onSubmit: (details: any) => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Tone options with visual cues
const toneOptions = [
  { 
    value: "professional", 
    label: "Professional",
    description: "Formal and authoritative tone",
    icon: <FileText className="h-4 w-4" />,
    example: "Our comprehensive solution optimizes operational efficiency...",
    color: "text-[#bcee45]",
    bg: "bg-[#232323]"
  },
  { 
    value: "conversational", 
    label: "Conversational",
    description: "Friendly and approachable tone",
    icon: <Pencil className="h-4 w-4" />,
    example: "Hey there! Let's talk about how we can help you...",
    color: "text-[#bcee45]",
    bg: "bg-[#232323]"
  },
  { 
    value: "persuasive", 
    label: "Persuasive",
    description: "Compelling and action-oriented",
    icon: <Target className="h-4 w-4" />,
    example: "Don't miss this exclusive opportunity to transform your...",
    color: "text-[#bcee45]",
    bg: "bg-[#232323]"
  },
  { 
    value: "humorous", 
    label: "Humorous",
    description: "Light-hearted and entertaining",
    icon: <Sparkles className="h-4 w-4" />,
    example: "Ready to make your competitors jealous? Here's how...",
    color: "text-[#bcee45]",
    bg: "bg-[#232323]"
  }
];

// Length options
const lengthOptions = [
  { 
    value: "short", 
    label: "Short", 
    description: "Concise and to the point",
    wordCount: "50-100 words" 
  },
  { 
    value: "medium", 
    label: "Medium", 
    description: "Balanced length",
    wordCount: "200-300 words" 
  },
  { 
    value: "long", 
    label: "Long", 
    description: "Comprehensive coverage",
    wordCount: "500+ words" 
  }
];

// Image style options with specific visual styles
const imageStyleOptions = [
  { 
    value: "modern", 
    label: "Modern & Clean",
    description: "Contemporary, minimalist aesthetic with clean lines",
    preview: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    value: "vibrant", 
    label: "Vibrant & Colorful",
    description: "Bold colors, high contrast, eye-catching design",
    preview: "https://images.unsplash.com/photo-1549740425-5e9ed4d8cd34?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    value: "professional", 
    label: "Professional & Corporate",
    description: "Business-focused, polished and refined look",
    preview: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop"
  },
  { 
    value: "artistic", 
    label: "Artistic & Creative",
    description: "Unique, creative approach with artistic elements",
    preview: "https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?q=80&w=1936&auto=format&fit=crop"
  }
];

// Content type specific prompts
const contentTypePrompts: Record<string, string> = {
  "instagram": "Create an engaging Instagram post about...",
  "linkedin": "Write a professional LinkedIn update about...",
  "twitter": "Craft an engaging tweet about...",
  "blog-post": "Write a blog post about..."
};

export function ContentDetailsForm({ contentType, onSubmit }: ContentDetailsFormProps) {
  const [activeTab, setActiveTab] = useState("content");
  const [formData, setFormData] = useState({
    topic: "",
    tone: "professional",
    length: "medium",
    keywords: "",
    audience: "",
    includeImage: true,
    imageStyle: "modern",
    imagePrompt: "",
    visualElements: [],
    colorScheme: "brand",
    layoutOption: "balanced"
  });

  // Glowing animation for elements
  const glowControls = useAnimation();
  const glowRef = useRef<HTMLDivElement>(null);
  
  // Start the glow animation when component mounts
  useEffect(() => {
    const animateGlow = async () => {
      while (true) {
        await glowControls.start({
          opacity: [0.3, 0.5, 0.3],
          transition: { duration: 3, ease: "easeInOut" }
        });
      }
    };
    
    animateGlow();
  }, [glowControls]);

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "blog-post":
        return "Blog Post";
      case "instagram":
        return "Instagram Post";
      case "linkedin":
        return "LinkedIn Post";
      case "twitter":
        return "Twitter Post";
      default:
        return type;
    }
  };

  const getPlaceholderText = () => {
    switch (contentType) {
      case "blog-post":
        return "How to improve customer retention and boost loyalty";
      case "instagram":
        return "Introducing our new summer collection with eco-friendly materials";
      case "linkedin":
        return "Announcing our company's innovative approach to remote work";
      case "twitter":
        return "Excited to share our latest product feature that solves a common problem";
      default:
        return "Enter your content topic";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, includeImage: checked }));
  };

  const handleToneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tone: value }));
  };

  const handleLengthChange = (value: string) => {
    setFormData((prev) => ({ ...prev, length: value }));
  };

  const handleImageStyleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, imageStyle: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatically generate image prompt if not provided
    let updatedFormData = { ...formData };
    if (formData.includeImage && !formData.imagePrompt.trim()) {
      updatedFormData.imagePrompt = `${formData.imageStyle} style image related to: ${formData.topic}`;
    }
    
    onSubmit(updatedFormData);
  };

  // Generate image prompt based on content details
  const generateImagePrompt = () => {
    if (!formData.topic) return "";
    
    let promptBase = "";
    
    switch (contentType) {
      case "instagram":
        promptBase = `Create a visually striking ${formData.imageStyle} style image for Instagram featuring: ${formData.topic}`;
        break;
      case "linkedin":
        promptBase = `Design a professional ${formData.imageStyle} style image suitable for LinkedIn about: ${formData.topic}`;
        break;
      case "twitter":
        promptBase = `Generate an attention-grabbing ${formData.imageStyle} style image for Twitter related to: ${formData.topic}`;
        break;
      case "blog-post":
        promptBase = `Create a high-quality header image in ${formData.imageStyle} style for a blog post about: ${formData.topic}`;
        break;
      default:
        promptBase = `Create a ${formData.imageStyle} style image related to: ${formData.topic}`;
    }
    
    setFormData(prev => ({ ...prev, imagePrompt: promptBase }));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Animated glow spots */}
      <motion.div 
        ref={glowRef}
        animate={glowControls}
        className="absolute top-40 -left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30 pointer-events-none"
      ></motion.div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="bg-[#232323] p-1 rounded-lg border border-[#323232]">
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400 flex items-center"
            >
              <AlignLeft className="mr-2 h-4 w-4" />
              Content Details
            </TabsTrigger>
            <TabsTrigger 
              value="visuals" 
              className="data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616] text-gray-400 flex items-center"
            >
              <Camera className="mr-2 h-4 w-4" />
              Visual Elements
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "content" && (
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#161616]/50 backdrop-blur-sm hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative mb-6">
                <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-[#bcee45]">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Creating a <strong>{getContentTypeLabel(contentType)}</strong> with AI assistance</span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-gray-300 flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-[#bcee45]" />
                  What's your topic or main idea?
                </Label>
                <Textarea
                  id="topic"
                  name="topic"
                  placeholder={getPlaceholderText()}
                  value={formData.topic}
                  onChange={handleChange}
                  className="min-h-24 bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30 placeholder:text-gray-500"
                  required
                />
                <div className="mt-1 text-xs text-gray-500 flex items-center">
                  <Code className="h-3 w-3 mr-1" />
                  <span>Be specific and descriptive for better results</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-gray-300 flex items-center">
                <Pencil className="mr-2 h-4 w-4 text-[#bcee45]" />
                Tone of voice
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {toneOptions.map((tone) => (
                  <div
                    key={tone.value}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      formData.tone === tone.value 
                        ? 'border-[#bcee45]/40 bg-[#bcee45]/5'
                        : 'border-[#323232] hover:border-[#bcee45]/20 bg-[#232323]/50'
                    }`}
                    onClick={() => handleToneChange(tone.value)}
                  >
                    <div className="flex items-center">
                      <div className={`mr-2 ${tone.color}`}>
                        {tone.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">{tone.label}</div>
                        <div className="text-xs text-gray-400">{tone.description}</div>
                      </div>
                    </div>
                    <div className={`mt-2 text-xs italic pl-2 border-l-2 border-[#bcee45]/30 text-gray-300`}>
                      "{tone.example}"
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-gray-300 flex items-center">
                <AlignLeft className="mr-2 h-4 w-4 text-[#bcee45]" />
                Content Length
              </Label>
              <RadioGroup 
                value={formData.length} 
                onValueChange={handleLengthChange}
                className="flex"
              >
                {lengthOptions.map((option) => (
                  <div key={option.value} className="flex-1">
                    <Label
                      htmlFor={`length-${option.value}`}
                      className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.length === option.value
                          ? 'bg-[#bcee45]/5 border-[#bcee45]/40'
                          : 'border-[#323232] hover:border-[#bcee45]/20 bg-[#232323]/50'
                      }`}
                    >
                      <RadioGroupItem 
                        id={`length-${option.value}`} 
                        value={option.value} 
                        className="sr-only"
                      />
                      <span className="font-medium text-white">{option.label}</span>
                      <span className="text-xs text-gray-400 text-center">{option.description}</span>
                      <span className="text-xs text-[#bcee45] mt-1">{option.wordCount}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="keywords" className="text-gray-300 flex items-center">
                <Hash className="mr-2 h-4 w-4 text-[#bcee45]" />
                Keywords (optional)
              </Label>
              <Input
                id="keywords"
                name="keywords"
                placeholder="Enter keywords separated by commas"
                value={formData.keywords}
                onChange={handleChange}
                className="bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30 placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500 flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                <span>Add keywords you want to include in your content</span>
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="audience" className="text-gray-300 flex items-center">
                <Users className="mr-2 h-4 w-4 text-[#bcee45]" />
                Target Audience (optional)
              </Label>
              <Input
                id="audience"
                name="audience"
                placeholder="e.g., Small business owners, Tech professionals"
                value={formData.audience}
                onChange={handleChange}
                className="bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30 placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500 flex items-center">
                <Target className="h-3 w-3 mr-1" />
                <span>Who is this content intended for?</span>
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="pt-4">
              <Button
                type="button"
                onClick={() => setActiveTab("visuals")}
                className="w-full bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  Next: Visual Elements
                  <Camera className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "visuals" && (
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label htmlFor="include-image" className="mb-1 text-gray-300 flex items-center">
                <ImageIcon className="mr-2 h-4 w-4 text-[#bcee45]" />
                Include an Image
              </Label>
              <span className="text-sm text-gray-400">
                Generate an AI image for your content
              </span>
              <Switch
                id="include-image"
                checked={formData.includeImage}
                onCheckedChange={handleSwitchChange}
                className="data-[state=checked]:bg-[#bcee45]"
              />
              </div>
            </motion.div>

            {formData.includeImage && (
              <>
                <motion.div variants={itemVariants} className="space-y-4">
                  <Label className="text-gray-300 flex items-center">
                    <Palette className="mr-2 h-4 w-4 text-[#bcee45]" />
                    Image Style
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageStyleOptions.map((style) => (
                      <div
                        key={style.value}
                        className={`cursor-pointer relative overflow-hidden rounded-lg ${
                          formData.imageStyle === style.value 
                            ? 'ring-2 ring-[#bcee45] ring-opacity-50'
                            : 'ring-1 ring-[#323232] hover:ring-[#bcee45]/30'
                        }`}
                        onClick={() => handleImageStyleChange(style.value)}
                      >
                        <div className="aspect-[4/3] relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-[#161616] to-transparent z-10"></div>
                          <img 
                            src={style.preview} 
                            alt={style.label} 
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                            <div className="font-medium text-white text-sm">{style.label}</div>
                            <div className="text-xs text-gray-300 line-clamp-1">{style.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="imagePrompt" className="text-gray-300 flex items-center">
                      <Terminal className="mr-2 h-4 w-4 text-[#bcee45]" />
                      Image Description
                    </Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={generateImagePrompt}
                      className="text-xs text-[#bcee45] hover:bg-[#232323] border-none"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Auto-generate
                    </Button>
                  </div>
                  <Textarea
                    id="imagePrompt"
                    name="imagePrompt"
                    placeholder="Describe what you want in the image with specific details for best results"
                    value={formData.imagePrompt}
                    onChange={handleChange}
                    className="min-h-24 bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30 placeholder:text-gray-500"
                  />
                  <div className="p-3 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
                    <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-start gap-3">
                      <BrainCircuit className="h-4 w-4 text-[#bcee45] mt-1" />
                      <div>
                        <p className="text-xs text-gray-300 mb-1">Image Generation Tips</p>
                        <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                          <li>Be specific about subject, style, lighting, and mood</li>
                          <li>Include details about composition and perspective</li>
                          <li>Specify colors and visual elements you want to include</li>
                          <li>For content-specific images, describe how it relates to your topic</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label className="text-gray-300 flex items-center">
                    <Layout className="mr-2 h-4 w-4 text-[#bcee45]" />
                    Image Layout
                  </Label>
                  <Select
                    value={formData.layoutOption}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, layoutOption: value }))}
                  >
                    <SelectTrigger className="bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30">
                      <SelectValue placeholder="Select layout style" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#323232] text-gray-300">
                      <SelectItem value="balanced">Balanced (Default)</SelectItem>
                      <SelectItem value="centered">Text Centered</SelectItem>
                      <SelectItem value="left-aligned">Left Aligned Text</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="impactful">Bold & Impactful</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label className="text-gray-300 flex items-center">
                    <Palette className="mr-2 h-4 w-4 text-[#bcee45]" />
                    Color Scheme
                  </Label>
                  <Select
                    value={formData.colorScheme}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, colorScheme: value }))}
                  >
                    <SelectTrigger className="bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#323232] text-gray-300">
                      <SelectItem value="brand">Brand Colors</SelectItem>
                      <SelectItem value="dark">Dark & Moody</SelectItem>
                      <SelectItem value="light">Light & Airy</SelectItem>
                      <SelectItem value="vibrant">Vibrant & Colorful</SelectItem>
                      <SelectItem value="monochrome">Monochromatic</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </>
            )}

            <motion.div variants={itemVariants} className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("content")}
                className="sm:flex-1 border-[#323232] text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30"
              >
                Back to Content Details
              </Button>
              <Button
                type="submit"
                className="sm:flex-1 bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  Generate Content
                  <Sparkles className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}