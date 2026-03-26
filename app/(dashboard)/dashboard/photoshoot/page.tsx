// app/(dashboard)/dashboard/photoshoot/page.tsx
'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  Terminal, 
  Zap,
  Camera,
  Code,
  Package,
  Layers,
  MousePointer
} from "lucide-react";
import { createPhotographySession, selectImage, getPreviousPhotographySessions } from "@/app/actions/product-photography";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import Masonry from 'react-masonry-css';

const PRODUCT_TYPES = [
  "electronics",
  "fashion",
  "food",
  "furniture",
  "jewelry",
  "cosmetics",
  "sports",
  "toys"
];

const PHOTOGRAPHY_STYLES = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean dark background with precision lighting",
    icon: <Layers className="h-6 w-6 text-[#161616]" />
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    description: "Contextual environment with natural elements",
    icon: <Camera className="h-6 w-6 text-[#161616]" />
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium effect with sophisticated styling",
    icon: <Zap className="h-6 w-6 text-[#161616]" />
  },
  {
    id: "studio",
    name: "Studio",
    description: "Professional studio with controlled lighting",
    icon: <Terminal className="h-6 w-6 text-[#161616]" />
  }
];

export default function PhotoshootPage() {
  const [step, setStep] = useState(0);
  const [productType, setProductType] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  const [prevLoading, setPrevLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<any>(null);
  const [showOriginal, setShowOriginal] = useState<string | null>(null);
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const [dynamicText, setDynamicText] = useState('Generating your stunning product photos...');
  
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();

  // Fetch previous generations
  useEffect(() => {
    setPrevLoading(true);
    getPreviousPhotographySessions().then(res => {
      if (res.success) setPreviousSessions(res.sessions || []);
      setPrevLoading(false);
    });
    
    // Animate the glow effect
    let mounted = true;
    const animateGlow = async () => {
      while (mounted) {
        await glowControls.start({
          opacity: [0.3, 0.5, 0.3],
          transition: { duration: 3, ease: "easeInOut" }
        });
      }
    };
    
    animateGlow();
    return () => { mounted = false; };
  }, [glowControls]);

  // Dynamic loading text
  useEffect(() => {
    if (!loading) return;
    const texts = [
      'Generating enhanced product imagery...',
      'Applying neural rendering algorithms...',
      'Optimizing visual marketing parameters...',
      'Calibrating lighting vectors...',
      'Finalizing product enhancement...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setDynamicText(texts[i % texts.length]);
      i++;
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  // Masonry grid breakpoints
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !productType || !selectedStyle) return;

    setLoading(true);
    try {
      const result = await createPhotographySession(
        productType,
        selectedStyle as any,
        image
      );

      if (result.success) {
        console.log(result);
        setStep(4);
        // Use the returned Cloudinary URLs
        setGeneratedImages(result.images.map(img => ({
          id: img.id,
          url: img.url
        })));
        
        toast({
          title: "Success",
          description: "Images generated successfully",
          variant: "default",
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
        description: "Failed to generate images. Please try again.",
        variant: "destructive",
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = async (imageId: string) => {
    try {
      await selectImage(imageId);
      toast({
        title: "Success",
        description: "Image selected successfully",
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select image",
        variant: "destructive",
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    }
  };

  // Modal open/close
  const openModal = (img: any) => {
    setModalImage(img);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalImage(null);
  };

  // Hold to show original
  const handleHoldStart = (originalUrl: string) => {
    holdTimeout.current = setTimeout(() => setShowOriginal(originalUrl), 350);
  };
  const handleHoldEnd = () => {
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    setShowOriginal(null);
  };

  // Add event listener for Escape key to close modal
  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  return (
    <div className="flex flex-col space-y-6 text-gray-200 min-h-screen px-4 sm:px-6 py-6 relative">
      {/* Ambient background elements */}
      <div className="fixed inset-0">
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mr-3 h-8 w-8 rounded-md bg-[#bcee45] flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-[#161616]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Product <span className="text-[#bcee45]">Photoshoot</span>
            </h1>
          </motion.div>
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-gray-400 ml-11">Transform product photos with neural rendering</p>
            {/* Typewriter blinking cursor effect */}
            <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-2 h-4 bg-[#bcee45] animate-blink"></div>
          </motion.div>
        </div>
      </div>
      
      {/* Previous Generations Section (show only if not in photoshoot steps) */}
      {step === 0 && (
        <div>
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <p className="text-gray-400">
              Use AI to enhance product visuals for marketing and e-commerce
            </p>
            <Button
              className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group px-6 py-6"
              onClick={() => setStep(1)}
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="relative  flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                Start New Photoshoot
              </span>
            </Button>
          </div>
          
          <div>
            {prevLoading ? (
              <div className="w-full flex justify-center py-12 animate-pulse text-xl text-gray-400">
                <div className="flex items-center">
                  <Terminal className="mr-2 h-5 w-5 text-[#bcee45]" /> 
                  Loading image database...
                </div>
              </div>
            ) : previousSessions.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                <div className="p-6 rounded-full bg-[#232323] mb-2">
                  <Camera className="h-10 w-10 text-[#bcee45]" />
                </div>
                <p>No previous photoshoots yet. Start your first one!</p>
                <div className="mt-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group px-8 py-4 hover:border-[#bcee45]/30 transition-all">
                  {/* Edge glow effect */}
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-start gap-3">
                    <Code className="h-4 w-4 text-[#bcee45] mt-1" />
                    <p className="text-sm text-gray-400">
                      Our neural rendering engine can transform basic product photos into professional marketing visuals
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-6 border border-[#323232] relative group overflow-hidden shadow-lg shadow-black/20">
                {/* Top illuminated border */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
              
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="flex gap-6"
                  columnClassName="masonry-column flex flex-col gap-6"
                >
                  {previousSessions.map(session => session.images.map((img: any) => (
                    <motion.div
                      key={img.id}
                      className="relative group rounded-xl overflow-hidden shadow-lg cursor-pointer bg-[#232323] border border-[#323232] group hover:border-[#bcee45]/30 transition-all"
                      whileHover={{ scale: 1.03 }}
                      onClick={() => openModal({ ...img, session })}
                      onMouseDown={() => handleHoldStart(img.originalUrl)}
                      onMouseUp={handleHoldEnd}
                      onMouseLeave={handleHoldEnd}
                      onTouchStart={() => handleHoldStart(img.originalUrl)}
                      onTouchEnd={handleHoldEnd}
                    >
                      <Image
                        src={showOriginal === img.originalUrl ? img.originalUrl : img.generatedUrls[0]}
                        alt="Generated product"
                        width={400}
                        height={400}
                        className={`object-cover w-full aspect-square transition-all duration-300 ${showOriginal === img.originalUrl ? 'grayscale blur-sm' : ''}`}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-semibold text-lg capitalize">{session.productType}</span>
                          <div className="p-1 rounded bg-[#bcee45]/20 text-[#bcee45] text-xs">
                            {session.style}
                          </div>
                        </div>
                        <span className="text-xs text-white/60">{new Date(session.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="absolute top-2 right-2 bg-[#232323] text-[#bcee45] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MousePointer className="h-3 w-3" />
                      </div>
                    </motion.div>
                  )))}
                </Masonry>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for image analysis */}
      {modalOpen && modalImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-[#1a1a1a] rounded-xl shadow-2xl p-0 max-w-lg w-full relative flex flex-col max-h-[90vh] overflow-hidden border border-[#323232]"
            onClick={e => e.stopPropagation()}
          >
            {/* Top illuminated border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
            
            <button className="absolute top-3 right-3 text-gray-400 hover:text-white " onClick={closeModal}>
              <X className="w-6 h-6" />
            </button>
            <div className="overflow-y-auto p-6 flex-1 flex flex-col items-center">
              <Image
                src={modalImage.generatedUrls ? modalImage.generatedUrls[0] : modalImage.url}
                alt="Generated product large"
                width={500}
                height={500}
                className="object-contain w-full rounded-lg mb-4"
              />
              <div className="space-y-2 w-full">
                <div className="font-bold text-lg capitalize text-white">{modalImage.session?.productType}</div>
                <div className="text-sm text-gray-400">Style: {modalImage.session?.style}</div>
                <div className="text-xs text-gray-500 break-all">Session ID: {modalImage.session?.id}</div>
                <div className="text-xs text-gray-500">Created: {new Date(modalImage.session?.createdAt).toLocaleString()}</div>
                <div className="mt-4 p-3 bg-[#232323] rounded border border-[#323232] flex items-center justify-between">
                  <span className="text-xs text-gray-400">Hold to preview original image</span>
                  <div className="px-2 py-1 rounded bg-[#bcee45]/20 text-[#bcee45] text-xs">Neural enhanced</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photoshoot Steps (existing UI) - only show if step !== 0 */}
      <AnimatePresence mode="wait">
        {step !== 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                {/* Top illuminated border */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Package className="h-4 w-4 mr-2 text-[#bcee45]" />
                    Select Asset Category
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Define product classification for optimal rendering
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {PRODUCT_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant={productType === type ? "default" : "outline"}
                        className={`h-24 flex flex-col gap-2 ${
                          productType === type 
                            ? 'bg-[#bcee45] text-[#161616] hover:bg-[#dcff65]' 
                            : 'border-[#323232] bg-[#232323]  text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30'
                        }`}
                        onClick={() => setProductType(type)}
                      >
                        <span className="text-2xl">
                          {type === "electronics" && "📱"}
                          {type === "fashion" && "👕"}
                          {type === "food" && "🍽️"}
                          {type === "furniture" && "🪑"}
                          {type === "jewelry" && "💍"}
                          {type === "cosmetics" && "💄"}
                          {type === "sports" && "⚽"}
                          {type === "toys" && "🧸"}
                        </span>
                        <span className="capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                  {productType && (
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => setStep(2)}
                        className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                        <span className="relative  flex items-center">
                          Next
                          <Terminal className="ml-2 h-4 w-4" />
                        </span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                  {/* Top illuminated border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                  
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-[#bcee45]" />
                      Set Visual Parameters
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Define the rendering style for your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PHOTOGRAPHY_STYLES.map((style) => (
                        <Button
                          key={style.id}
                          variant={selectedStyle === style.id ? "default" : "outline"}
                          className={`h-32 flex flex-col gap-2 ${
                            selectedStyle === style.id 
                              ? 'bg-[#bcee45] text-[#161616] hover:bg-[#dcff65]' 
                              : 'border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30'
                          }`}
                          onClick={() => setSelectedStyle(style.id)}
                        >
                          <div className={`p-2 rounded-md ${selectedStyle === style.id ? 'bg-[#161616]/20' : 'bg-[#bcee45]/20'}`}>
                            {style.icon}
                          </div>
                          <span className="font-semibold">{style.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {style.description}
                          </span>
                        </Button>
                      ))}
                    </div>
                    {selectedStyle && (
                      <div className="mt-4 flex justify-end">
                        <Button 
                          onClick={() => setStep(3)}
                          className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                          <span className="relative  flex items-center">
                            Next
                            <Terminal className="ml-2 h-4 w-4" />
                          </span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                  {/* Top illuminated border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                  
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Camera className="h-4 w-4 mr-2 text-[#bcee45]" />
                      Upload Source Asset
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Upload a clear photo for neural enhancement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#323232] rounded-lg bg-[#232323]/50 hover:bg-[#232323] transition-colors">
                      {image ? (
                        <div className="relative w-full max-w-md aspect-square">
                          <Image
                            src={image}
                            alt="Uploaded product"
                            fill
                            className="object-contain rounded-lg"
                          />
                          <Button
                            variant="outline"
                            className="absolute top-2 right-2 border-[#323232] text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                            onClick={() => setImage(null)}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 rounded-full bg-[#bcee45]/20 mb-4">
                            <UploadCloud className="h-10 w-10 text-[#bcee45]" />
                          </div>
                          <p className="text-gray-400 mb-2">
                            Drag and drop your product photo here
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            Supports JPG, PNG, WEBP - max 10MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                        <label htmlFor="image-upload">
  <Button asChild className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616]">
    <span>Select File</span>
  </Button>
</label>
                        </>
                      )}
                    </div>
                    {image && (
                      <div className="mt-6 flex justify-between items-center">
                        <div className="p-3 bg-[#232323]/80 rounded-lg border border-[#323232] flex items-center">
                          <Code className="h-4 w-4 text-[#bcee45] mr-2" />
                          <p className="text-xs text-gray-400">
                            AI will enhance while preserving product details
                          </p>
                        </div>
                        <Button 
                          onClick={handleGenerate} 
                          disabled={loading}
                          className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                          <span className="relative  flex items-center">
                            {loading ? "Processing..." : "Generate Assets"}
                            <Zap className="ml-2 h-4 w-4" />
                          </span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {loading && (
                  <div className="fixed inset-0  flex flex-col items-center justify-center bg-[#161616]/90 backdrop-blur-sm">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 border-4 border-[#bcee45]/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-[#bcee45] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="mt-8 text-2xl font-bold text-[#bcee45] animate-pulse">{dynamicText}</div>
                    <div className="mt-4 max-w-md">
                      <p className="text-sm text-center text-gray-400">
                        <Code className="inline-block h-4 w-4 mr-1 text-[#bcee45]" /> Neural network analyzing your product characteristics and optimizing visual parameters...
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
                  {/* Top illuminated border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                  
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-[#bcee45]" />
                      Enhanced Assets
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Select the optimized images for your marketing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {loading ? (
                        // Loading skeleton
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#232323] animate-pulse">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-[#323232]" />
                            </div>
                          </div>
                        ))
                      ) : generatedImages.length > 0 ? (
                        // Generated images
                        generatedImages.map((img) => (
                          <div key={img.id} className="relative group">
                            <div className="relative aspect-square rounded-lg overflow-hidden border border-[#323232] group-hover:border-[#bcee45]/30 transition-all">
                              <Image
                                src={img.url}
                                alt="Generated product"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              {/* <div className="absolute inset-0 bg-[#161616]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                                  onClick={() => handleSelectImage(img.id)}
                                >
                                  <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                                  <span className="relative  flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Select
                                  </span>
                                </Button>
                              </div> */}
                              {/* Cyberpunk corner accent */}
                              <div className="absolute top-0 right-0 w-10 h-10 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute top-0 right-0 w-20 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right"></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        // No images state
                        <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
                          <div className="p-4 rounded-full bg-[#232323]">
                            <Code className="h-8 w-8 text-[#bcee45]" />
                          </div>
                          <p className="text-gray-400">No images generated yet</p>
                        </div>
                      )}
                    </div>
                    
                    {generatedImages.length > 0 && (
                      <div className="mt-6 p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden">
                        <div className="flex items-start gap-3">
                          <Terminal className="h-4 w-4 text-[#bcee45] mt-1" />
                          <div>
                            <p className="text-sm text-gray-300 mb-1">Asset Generation Complete</p>
                            <p className="text-xs text-gray-400">
                              Your product has been enhanced with our neural rendering engine. Select your preferred assets or return to the dashboard to start a new session.
                            </p>
                            <div className="mt-4 flex justify-end">
                            <Button 
  onClick={() => {
    // Fetch fresh data before returning to dashboard
    setPrevLoading(true);
    getPreviousPhotographySessions().then(res => {
      if (res.success) setPreviousSessions(res.sessions || []);
      setPrevLoading(false);
      setStep(0); // Only change step after data is refreshed
    });
  }}
  className="bg-[#232323] border border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
>
  Return to Dashboard
</Button>

                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
      
      {/* CSS for animations */}
      <style jsx global>{`
        .grid-pattern {
          background-size: 25px 25px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-in;
        }
        
        .masonry-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
}