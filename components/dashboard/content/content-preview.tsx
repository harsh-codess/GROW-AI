"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Copy, 
  PenSquare, 
  Check, 
  Download, 
  Share2, 
  Sparkles, 
  Zap, 
  Terminal, 
  ImageIcon,
  Code
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContentPreviewProps {
  content: {
    title?: string;
    content: string;
    imageUrl?: string;
  };
  contentType: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export function ContentPreview({ content, contentType }: ContentPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content.content);
  const [editedTitle, setEditedTitle] = useState(content.title || "");
  const [copied, setCopied] = useState(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  
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

  const handleCopyContent = () => {
    const textToCopy = content.title 
      ? `${content.title}\n\n${content.content}`
      : content.content;
      
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Content copied to clipboard!", {
      style: {
        background: "#232323",
        color: "white",
        border: "1px solid #323232"
      }
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleDownload = () => {
    const textToDownload = content.title 
      ? `${content.title}\n\n${content.content}`
      : content.content;
    
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contentType.replace("-", "_")}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Content downloaded successfully!", {
      style: {
        background: "#232323",
        color: "white",
        border: "1px solid #323232"
      }
    });
  };

  const handleShare = () => {
    toast.info("Sharing functionality coming soon!", {
      style: {
        background: "#232323",
        color: "white",
        border: "1px solid #323232"
      }
    });
  };

  const handleSaveEdit = () => {
    // In a real implementation, this would update the content via API
    setIsEditing(false);
    toast.success("Edits saved!", {
      style: {
        background: "#232323",
        color: "white",
        border: "1px solid #323232"
      }
    });
  };

  const getPreviewStyle = () => {
    switch (contentType) {
      case "instagram":
        return "instagram-preview";
      case "linkedin":
        return "linkedin-preview";
      case "twitter":
        return "twitter-preview";
      case "blog-post":
        return "blog-preview";
      default:
        return "";
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          {content.title !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-gray-300">Title</Label>
              <Input
                id="edit-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30 placeholder:text-gray-500"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="edit-content" className="text-gray-300">Content</Label>
            <Textarea
              id="edit-content"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-48 bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30 placeholder:text-gray-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="border-[#323232] text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="relative z-10">Save Changes</span>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={`preview-container relative ${getPreviewStyle()}`}>
        {contentType === "instagram" && content.imageUrl && (
          <div 
            className={`relative ${isImageEnlarged ? 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4' : 'w-full'}`}
            onClick={() => isImageEnlarged && setIsImageEnlarged(false)}
          >
            <img 
              src={content.imageUrl} 
              alt="Generated content" 
              className={`${isImageEnlarged ? 'max-h-screen max-w-full object-contain' : 'w-full h-auto object-cover aspect-square cursor-zoom-in'}`}
              onClick={(e) => {
                if (!isImageEnlarged) {
                  e.stopPropagation(); 
                  setIsImageEnlarged(true);
                }
              }}
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              AI Generated
            </div>
          </div>
        )}
        
        {contentType !== "instagram" && content.imageUrl && (
          <div 
            className={`relative ${isImageEnlarged ? 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4' : 'w-full max-h-64 overflow-hidden'}`}
            onClick={() => isImageEnlarged && setIsImageEnlarged(false)}
          >
            <img 
              src={content.imageUrl} 
              alt="Generated content" 
              className={`${isImageEnlarged ? 'max-h-screen max-w-full object-contain' : 'w-full h-auto object-cover cursor-zoom-in'}`}
              onClick={(e) => {
                if (!isImageEnlarged) {
                  e.stopPropagation(); 
                  setIsImageEnlarged(true);
                }
              }}
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              AI Generated
            </div>
          </div>
        )}
        
        <div className={contentType === "instagram" ? "p-4 bg-[#1a1a1a]" : ""}>
          {content.title && (
            <h2 className="text-xl font-bold mb-4 text-white">{content.title}</h2>
          )}
          <div className="whitespace-pre-line text-gray-300">
            {content.content.split("\n").map((line, index) => (
              <p key={index} className={line === "" ? "my-4" : "mb-2"}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated glow spots */}
      <motion.div 
        ref={glowRef}
        animate={glowControls}
        className="absolute top-40 -left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30 pointer-events-none"
      ></motion.div>
      
      <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
        {/* Top illuminated border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              {isEditing ? (
                <>
                  <PenSquare className="mr-2 h-4 w-4 text-[#bcee45]" />
                  Edit Content
                </>
              ) : (
                <>
                  <Terminal className="mr-2 h-4 w-4 text-[#bcee45]" />
                  Preview
                </>
              )}
            </h3>
            {!isEditing && (
              <div className="flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                      >
                        <PenSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#232323] text-gray-300 border-[#323232]">
                      <p>Edit content</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyContent}
                        className="flex items-center gap-1 border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-[#bcee45]" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#232323] text-gray-300 border-[#323232]">
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="flex items-center gap-1 border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#232323] text-gray-300 border-[#323232]">
                      <p>Download as text file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="flex items-center gap-1 border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#232323] text-gray-300 border-[#323232]">
                      <p>Share content</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          
          <div className="p-3 mb-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
            <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 text-[#bcee45] mt-1" />
              <div>
                <p className="text-xs text-gray-300">
                  AI-generated {getContentTypeLabel(contentType)} content
                </p>
              </div>
            </div>
          </div>
          
          <div className={`overflow-auto ${isEditing ? "" : "max-h-[600px] border border-[#323232] rounded-lg"}`}>
            {renderContent()}
          </div>
          
          {content.imageUrl && !isEditing && (
            <div className="mt-4 p-3 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start gap-3">
                <Code className="h-4 w-4 text-[#bcee45] mt-1" />
                <div>
                  <p className="text-xs text-gray-300 mb-1">Image Generation</p>
                  <p className="text-xs text-gray-400">
                    This image was created with AI based on your content and visual preferences. 
                    Click on the image to enlarge it. You can download and use it alongside your content.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* CSS for preview styling */}
      <style jsx global>{`
        .preview-container {
          padding: 1rem;
          background: #232323;
          border-radius: 0.5rem;
          color: #e5e7eb;
        }
        
        .instagram-preview {
          max-width: 440px;
          margin: 0 auto;
          background: #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .twitter-preview {
          max-width: 500px;
          margin: 0 auto;
          background: #1a1a1a;
          border-radius: 12px;
          padding: 1rem;
        }
        
        .linkedin-preview {
          max-width: 550px;
          margin: 0 auto;
          background: #1a1a1a;
          border-radius: 8px;
          padding: 1.5rem;
        }
        
        .blog-preview {
          max-width: 100%;
          margin: 0 auto;
          background: #1a1a1a;
          padding: 2rem;
        }
        
        .blog-preview h2 {
          font-size: 1.75rem;
          margin-bottom: 1.25rem;
          color: white;
        }
      `}</style>
    </motion.div>
  );
}

// Helper function to get content type label
function getContentTypeLabel(type: string) {
  switch (type) {
    case "blog-post":
      return "blog post";
    case "instagram":
      return "Instagram post";
    case "linkedin":
      return "LinkedIn post";
    case "twitter":
      return "Twitter post";
    default:
      return type;
  }
}