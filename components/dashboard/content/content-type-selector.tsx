"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  FileText,
  Sparkles,
  Zap
} from "lucide-react";

interface ContentTypeSelectorProps {
  onSelect: (type: string) => void;
}

// Content types with metadata - focused on just 4 most important types
const contentTypes = [
  {
    id: "instagram",
    title: "Instagram Post",
    description: "Create engaging captions and visuals optimized for Instagram's audience",
    icon: <Instagram className="h-6 w-6 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    imageURL: "https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    preview: "✨ Discover our latest collection designed for the modern enthusiast. Swipe to see more and let us know your favorite in the comments! #NewCollection #StyleInspiration"
  },
  {
    id: "linkedin",
    title: "LinkedIn Post",
    description: "Professional content that drives engagement and showcases expertise",
    icon: <Linkedin className="h-6 w-6 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    imageURL: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    preview: "Excited to announce our new partnership with Industry Leaders Inc. This collaboration will help us drive innovation in our sector while delivering more value to our clients..."
  },
  {
    id: "twitter",
    title: "Twitter Post",
    description: "Concise, engaging tweets that spark conversation and sharing",
    icon: <Twitter className="h-6 w-6 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    imageURL: "https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=2074&auto=format&fit=crop",
    preview: "We're launching something big next week! Can you guess what it is? Hint: It's going to change how you think about productivity. #ComingSoon #StayTuned"
  },
  {
    id: "blog-post",
    title: "Blog Post",
    description: "In-depth content that educates your audience and builds authority",
    icon: <FileText className="h-6 w-6 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    imageURL: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop",
    preview: "10 Ways to Optimize Your Digital Marketing Strategy in 2025 - In today's rapidly evolving digital landscape, staying ahead of trends is crucial for success..."
  }
];

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
  },
  hover: { 
    scale: 1.03,
    transition: { type: "spring", stiffness: 300, damping: 10 }
  },
  tap: { 
    scale: 0.98,
    transition: { type: "spring", stiffness: 300, damping: 10 }
  }
};

export function ContentTypeSelector({ onSelect }: ContentTypeSelectorProps) {
  // Glowing animation for cards
  const glowControls = useAnimation();
  const glowRef = useRef<HTMLDivElement>(null);
  
  // Start the glow animation when component mounts
  useEffect(() => {
    const animateGlow = async () => {
      await glowControls.start({
        opacity: [0.3, 0.5, 0.3],
        transition: { duration: 3, ease: "easeInOut", repeat: Infinity }
      });
    };
    
    animateGlow();
  }, [glowControls]);

  return (
    <motion.div 
      className="flex flex-col space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated glow spots */}
      <motion.div 
        ref={glowRef}
        animate={glowControls}
        className="absolute top-40 left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30 pointer-events-none"
      ></motion.div>
      
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {contentTypes.map((type, index) => (
          <motion.div
            key={type.id}
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            className="cursor-pointer"
            onClick={() => onSelect(type.id)}
          >
            <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative h-full">
              {/* Glowing border effect on hover */}
              <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
              
              {/* Animated corner piece */}
              <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
              </div>
              
              <div className="flex flex-col md:flex-row h-full">
                {/* Left side - Preview image */}
                <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#161616] z-10"></div>
                  <img 
                    src={type.imageURL} 
                    alt={type.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-[#161616]/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 border border-[#323232] z-20">
                    <div className={`p-1 rounded-full ${type.iconBg}`}>
                      {type.icon}
                    </div>
                    <span className="ml-1 text-white">{type.title}</span>
                  </div>
                </div>
                
                {/* Right side - Content details */}
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-[#bcee45] transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{type.description}</p>
                  </div>
                  
                  {/* Preview section */}
                  <div className="mt-4">
                    <div className="border border-[#323232] bg-[#1a1a1a] rounded-md p-3 text-xs text-gray-300 max-h-24 overflow-hidden relative">
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none"></div>
                      {type.preview}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="bg-[#232323]/80 rounded-lg border border-[#323232] px-2 py-1 text-xs inline-flex items-center">
                        <Zap className="h-3 w-3 mr-1 text-[#bcee45]" />
                        <span className="text-gray-300">AI Enhanced</span>
                      </div>
                      <div className="text-[#bcee45] text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <span>Select</span>
                        <Sparkles className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}