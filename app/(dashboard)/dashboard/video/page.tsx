"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { generateVideo, getPreviousVideos } from "@/app/actions/video/newVideo";
import { PromptSelector } from './components/PromptSelector';
import { 
  Loader2, 
  PlayCircle, 
  Upload, 
  Video, 
  Sparkles, 
  Zap, 
  Terminal, 
  Code, 
  Film, 
  Clapperboard, 
  Clock,
  MousePointer,
  X
} from "lucide-react";

interface VideoSession {
  id: string;
  productType: string;
  status: string;
  video?: {
    videoUrl: string;
    originalImageUrl: string;
  };
}

interface PreviousVideo {
  id: string;
  videoUrl: string;
  originalImageUrl: string;
  status: string;
  createdAt: Date;
  session: {
    productType: string;
    id: string;
    status: string;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Animation presets for video styles
const videoStylePreviews = {
  '360° Rotation': '/video-previews/360-rotation.gif',
  'Hero Shot': '/video-previews/hero-shot.gif',
  'Exploded View': '/video-previews/exploded-view.gif',
  'Lifestyle Context': '/video-previews/lifestyle.gif',
  'Macro Detail': '/video-previews/macro-detail.gif',
  'Liquid Interaction': '/video-previews/liquid.gif',
  'Material Transformation': '/video-previews/material.gif'
};

export default function VideoPage() {
  const [imageData, setImageData] = useState<string>('');
  const [productType, setProductType] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previousVideos, setPreviousVideos] = useState<PreviousVideo[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [selectedPromptTitle, setSelectedPromptTitle] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewVideo, setPreviewVideo] = useState<PreviousVideo | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [dynamicText, setDynamicText] = useState('Initializing neural renderer...');
  
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();
  
  const { toast } = useToast();
  
  // Animate glow effect
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

  // Load previous videos
  useEffect(() => {
    loadPreviousVideos();
  }, []);
  
  // Simulate loading progress when generating video
  useEffect(() => {
    if (isLoading) {
      const texts = [
        'Initializing neural renderer...',
        'Processing image features...',
        'Generating motion vectors...',
        'Calculating cinematic parameters...',
        'Synthesizing video frames...',
        'Applying lighting effects...',
        'Rendering object transitions...',
        'Finalizing video output...'
      ];
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 3 + 1;
        if (progress > 95) progress = 95; // Never reach 100% until actually done
        setLoadingProgress(progress);
        setDynamicText(texts[Math.floor((progress / 95) * (texts.length - 1))]);
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const loadPreviousVideos = async () => {
    try {
      const result = await getPreviousVideos();
      if (result.success && result.videos) {
        setPreviousVideos(result.videos);
      }
    } catch (error) {
      console.error("Error loading previous videos:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePromptSelection = (prompt: string, title: string) => {
    setSelectedPrompt(prompt);
    setSelectedPromptTitle(title);
  };

  const handleGenerateVideo = async () => {
    if (!imageData || !productType || !productName || !selectedPrompt) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select an image",
        variant: "destructive",
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await generateVideo(
        productName,
        productType,
        imageData,
        selectedPrompt
      );
      
      if (result.success) {
        setVideoUrl(result.videoUrl);
        await loadPreviousVideos(); // Refresh the list after generating a new video
        toast({
          title: "Success",
          description: "Video generated successfully!",
          style: {
            background: "#232323",
            color: "white",
            border: "1px solid #323232"
          }
        });
        setLoadingProgress(100);
        setTimeout(() => {
          setStep(3);
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate video",
          variant: "destructive",
          style: {
            background: "#232323",
            color: "white",
            border: "1px solid #323232"
          }
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while generating the video",
        variant: "destructive",
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
  
  const openPreview = (video: PreviousVideo) => {
    setPreviewVideo(video);
    setPreviewOpen(true);
  };
  
  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewVideo(null);
  };
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const resetForm = () => {
    setImageData('');
    setProductType('');
    setProductName('');
    setVideoUrl('');
    setSelectedPrompt(null);
    setSelectedPromptTitle(null);
    setStep(1);
  };

  return (
    <div className="flex flex-col space-y-6 text-gray-200 min-h-screen relative">
      {/* Ambient background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#161616]"></div>
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        
        {/* Animated glow spots */}
        <motion.div 
          ref={glowRef}
          animate={glowControls}
          className="absolute top-40 left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30"
        ></motion.div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30"></div>
      </div>
      
      {/* Header */}
      <div className="z-10 flex items-center space-x-4">
        <div className="h-10 w-10 rounded-md bg-[#bcee45] flex items-center justify-center">
          <Film className="h-5 w-5 text-[#161616]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            AI <span className="text-[#bcee45]">Video Studio</span>
          </h1>
          <p className="text-gray-400">Transform static images into dynamic product videos</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                  {/* Top illuminated border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                  
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clapperboard className="h-5 w-5 mr-2 text-[#bcee45]" />
                      Step 1: Configure Video Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="productName" className="text-sm text-gray-300 flex items-center">
                            <Terminal className="h-4 w-4 mr-2 text-[#bcee45]" />
                            Product Name
                          </Label>
                          <Input
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Enter product name"
                            disabled={isLoading}
                            className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="productType" className="text-sm text-gray-300 flex items-center">
                            <Code className="h-4 w-4 mr-2 text-[#bcee45]" />
                            Product Category
                          </Label>
                          <Input
                            id="productType"
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                            placeholder="e.g., electronics, fashion, food"
                            disabled={isLoading}
                            className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label htmlFor="image" className="text-sm text-gray-300 flex items-center">
                          <Upload className="h-4 w-4 mr-2 text-[#bcee45]" />
                          Product Image
                        </Label>
                        <div className="border-2 border-dashed border-[#323232] rounded-xl min-h-[180px] flex flex-col items-center justify-center relative overflow-hidden bg-[#232323]/50 hover:bg-[#232323] transition-colors">
                          {imageData ? (
                            <div className="relative w-full h-full min-h-[180px]">
                              <img 
                                src={imageData} 
                                alt="Product Preview" 
                                className="object-contain w-full h-full p-2"
                              />
                              <button
                                className="absolute top-2 right-2 bg-[#232323] border border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30 rounded-full p-1"
                                onClick={() => setImageData('')}
                              >
                                <Loader2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center justify-center p-6 h-full w-full">
                              <div className="p-3 rounded-full bg-[#bcee45]/20 mb-4">
                                <Upload className="h-6 w-6 text-[#bcee45]" />
                              </div>
                              <p className="text-gray-400 text-center mb-2">Drag and drop or click to upload</p>
                              <p className="text-xs text-gray-500 text-center mb-2">High quality PNG or JPG recommended</p>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="mt-2 border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                                asChild
                              >
                                <span>Select File</span>
                              </Button>
                              <input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isLoading}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Cyberpunk detail element */}
                    <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden">
                      {/* Diagonal slash line */}
                      <div className="absolute -right-2 top-0 w-1 h-16 bg-[#bcee45]/20 rotate-45 transform origin-top-right"></div>
                      
                      <div className="flex items-start gap-3">
                        <Terminal className="h-4 w-4 text-[#bcee45] mt-1" />
                        <div>
                          <p className="text-sm text-gray-300 mb-1">Neural Rendering System</p>
                          <p className="text-xs text-gray-400">
                            Our AI engine transforms static product images into professional marketing videos. 
                            Provide a high-quality product image for optimal results. The system works best with 
                            clear, well-lit images on clean backgrounds.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        onClick={nextStep}
                        disabled={!imageData || !productType || !productName}
                        className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                        <span className="relative z-10 flex items-center">
                          Next: Select Video Style
                          <Zap className="ml-2 h-4 w-4" />
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                  {/* Top illuminated border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                  
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clapperboard className="h-5 w-5 mr-2 text-[#bcee45]" />
                      Step 2: Select Video Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-14 w-14 border-2 border-[#323232] rounded-lg overflow-hidden">
                        <img 
                          src={imageData}
                          alt="Product Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{productName}</h3>
                        <p className="text-sm text-gray-400">Category: {productType}</p>
                      </div>
                    </div>
                    
                    <PromptSelector
                      onSelectPrompt={(prompt, title) => handlePromptSelection(prompt, title)}
                      productType={productType}
                      productName={productName}
                    />
                    
                    {selectedPromptTitle && videoStylePreviews[selectedPromptTitle] && (
                      <div className="border border-[#323232] bg-[#232323]/50 rounded-xl p-4 mt-4">
                        <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-[#bcee45]" />
                          Style Preview: {selectedPromptTitle}
                        </h3>
                        <div className="flex items-center justify-center">
                          <img 
                            src={videoStylePreviews[selectedPromptTitle]} 
                            alt={`${selectedPromptTitle} preview`}
                            className="max-h-[200px] rounded-lg"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">
                          Visual representation of the selected style. Your results will vary based on your product.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        className="border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                      >
                        <span className="flex items-center">
                          <Clapperboard className="mr-2 h-4 w-4" />
                          Back to Setup
                        </span>
                      </Button>
                      
                      <Button
                        onClick={handleGenerateVideo}
                        disabled={isLoading || !selectedPrompt}
                        className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                        <span className="relative z-10 flex items-center">
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Video
                            </>
                          )}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Loading overlay */}
                {isLoading && (
                  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="mb-8 w-64 h-2 bg-[#232323] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#bcee45] to-[#dcff65] transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xl font-bold text-[#bcee45] animate-pulse mb-2">{dynamicText}</div>
                    <p className="text-gray-400 text-sm max-w-md text-center">
                      Our neural network is generating a dynamic video based on your product image. 
                      This process typically takes 30-60 seconds.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
            
            {step === 3 && videoUrl && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                  {/* Top illuminated border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                  
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clapperboard className="h-5 w-5 mr-2 text-[#bcee45]" />
                      Generated Video: {productName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-3/5">
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-[#323232] bg-[#232323]">
                          <video
                            src={videoUrl}
                            controls
                            autoPlay
                            loop
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      
                      <div className="md:w-2/5 space-y-4">
                        <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232]">
                          <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                            <Terminal className="h-4 w-4 mr-2 text-[#bcee45]" />
                            Video Details
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-400">Product:</span> <span className="text-white">{productName}</span></p>
                            <p><span className="text-gray-400">Category:</span> <span className="text-white">{productType}</span></p>
                            <p><span className="text-gray-400">Style:</span> <span className="text-white">{selectedPromptTitle}</span></p>
                            <p><span className="text-gray-400">Created:</span> <span className="text-white">{new Date().toLocaleString()}</span></p>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-[#232323] border border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                          onClick={() => {
                            // Download functionality
                            const a = document.createElement('a');
                            a.href = videoUrl;
                            a.download = `${productName.replace(/\s+/g, '-').toLowerCase()}-video.mp4`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                        >
                          <span className="flex items-center">
                            <Video className="mr-2 h-4 w-4" />
                            Download Video
                          </span>
                        </Button>
                        
                        <Button
                          className="w-full bg-[#232323] border border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                          onClick={resetForm}
                        >
                          <span className="flex items-center">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create Another Video
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group h-full">
            {/* Top illuminated border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
            
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-[#bcee45]" />
                Previous Videos
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-[#323232] scrollbar-track-transparent">
              {previousVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-[#232323] mb-4">
                    <Film className="h-8 w-8 text-[#bcee45]" />
                  </div>
                  <p className="text-gray-400 mb-2">No videos generated yet</p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Your AI-generated videos will appear here. Get started by filling out the form.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {previousVideos.map((video) => (
                    <motion.div 
                      key={video.id} 
                      className="relative group/item rounded-lg overflow-hidden border border-[#323232] bg-[#232323] cursor-pointer hover:border-[#bcee45]/30 transition-all"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => openPreview(video)}
                    >
                      <div className="aspect-video bg-black relative">
                        <video
                          src={video.videoUrl}
                          muted
                          className="w-full h-full object-cover opacity-80"
                          // Play on hover
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 group-hover/item:opacity-0 transition-opacity">
                          <PlayCircle className="h-10 w-10 text-[#bcee45]" />
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-white capitalize">{video.session.productType}</div>
                          <div className="text-xs text-[#bcee45]">{new Date(video.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="absolute top-2 right-2 bg-[#232323] text-[#bcee45] rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <MousePointer className="h-3 w-3" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Video Preview Modal */}
      {previewOpen && previewVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div 
            className="relative w-full max-w-4xl rounded-xl overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10">
              <button 
                className="bg-[#232323]/80 text-white rounded-full p-2 hover:bg-[#bcee45] hover:text-[#161616] transition-colors"
                onClick={closePreview}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                src={previewVideo.videoUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            </div>
            <div className="bg-[#1a1a1a] border-t border-[#323232] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white capitalize">{previewVideo.session.productType}</h3>
                  <p className="text-sm text-gray-400">Created: {new Date(previewVideo.createdAt).toLocaleString()}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium"
                  onClick={() => {
                    // Download functionality
                    const a = document.createElement('a');
                    a.href = previewVideo.videoUrl;
                    a.download = `product-video-${previewVideo.id}.mp4`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <span className="flex items-center">
                    <Video className="mr-2 h-4 w-4" />
                    Download
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for animations */}
      <style jsx global>{`
        .grid-pattern {
          background-size: 25px 25px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
        
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          border-radius: 100vh;
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #323232;
          border-radius: 100vh;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #bcee45;
        }
        
        /* Animations */
        @keyframes move1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, 20px); }
          50% { transform: translate(0, 40px); }
          75% { transform: translate(-20px, 20px); }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes rotate360 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}