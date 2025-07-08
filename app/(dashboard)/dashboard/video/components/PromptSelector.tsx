import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import React from 'react';
import { 
  Check, 
  Clapperboard, 
  RotateCcw, 
  Compass, 
  SplitSquareVertical, 
  Users, 
  Droplets, 
  Layers,
  ZoomIn,
  ArrowRight,
  Play,
  Info
} from 'lucide-react';

// Video style options with rich visual elements
const videoStyles = [
  {
    id: 0,
    title: '360° Rotation',
    icon: <RotateCcw className="h-5 w-5 text-[#bcee45]" />,
    description: 'Professional product showcase with smooth rotation and cinematic lighting',
    previewImage: 'https://images.unsplash.com/photo-1588437637054-663ccbceef9a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fDM2MCVDMiVCMCUyMFJvdGF0aW9ufGVufDB8fDB8fHww',
    demoGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExazdhdmI1MDZ0NXYzcjdtaGFjOWM1eThjaHlyM3R4dDQ5bWc3cGk5dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6nV3iOqyG2YOYBpu/giphy.gif',
    beforeImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1780&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1780&auto=format&fit=crop',
    highlights: [
      'Full 360° product views',
      'Professional lighting effects',
      'Smooth camera movement',
      'High-end product presentation'
    ],
    prompt : `Inside an Well lit studio [truck left, pan right, tracking shot] bullet time effect, a close-up reveals the product /{productName}/ of type /{productType}/, Cinematic lighting`,
  },
  {
    id: 1,
    title: 'Hero Shot',
    icon: <Compass className="h-5 w-5 text-[#bcee45]" />,
    description: 'Dramatic centerpiece presentation with atmospheric lighting',
    previewImage: 'https://images.unsplash.com/photo-1560529178-855fa2041193?q=80&w=2crop',
    demoGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjA3ZHQ1Z2Nuc3llYWlqZnU3NzdscWE3ZDVhNXZ3emtnY2xudTBkayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UsSz38PDv4QSHHXyY4/giphy.gif',
    beforeImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1770&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=1769&auto=format&fit=crop',
    highlights: [
      'Dramatic lighting effects',
      'Atmospheric elements',
      'Premium presentation',
      'Cinematic camera moves'
    ],
    prompt: `[Hero shot, cinematic lighting, professional product showcase] The {productType} "{productName}" is centered on a pedestal in a dark studio. [Slow zoom in, top-down light beam] Beams of light highlight its contours as mist or haze adds atmosphere. [Macro close-up] The camera glides over the surface, capturing fine details like texture and logo. [Final wide shot] The product stands bold and commanding against a minimal backdrop, exuding power and luxury.`
  },
  {
    id: 2,
    title: 'Exploded View',
    icon: <SplitSquareVertical className="h-5 w-5 text-[#bcee45]" />,
    description: 'Technical showcase revealing internal components and assembly',
    previewImage: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?q=80&w=2069&auto=format&fit=crop',
    demoGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTRjcXdhdWZuODUyaGRpdnVyanZqemo2YnA2ZHptaWF5bGhqdWY1ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ydMZiEb0VgI6f6p0gE/giphy.gif',
    beforeImage: 'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1770&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1472437774355-71ab6752b434?q=80&w=1774&auto=format&fit=crop',
    highlights: [
      'Component separation',
      'Internal structure reveal',
      'Technical highlighting',
      'Assembly animation'
    ],
    prompt: `[Exploded view, cinematic reveal, technical showcase] The {productType} "{productName}" floats in mid-air. [Slow pull apart] Components separate smoothly, revealing the internal parts in mid-rotation. [Focus shift] Camera pans across layers, highlighting engineering and craftsmanship. [Reassembly shot] Parts lock back into place with a satisfying snap, finishing on a polished hero shot under soft studio lighting.`
  },
  {
    id: 3,
    title: 'Lifestyle Context',
    icon: <Users className="h-5 w-5 text-[#bcee45]" />,
    description: 'Blend of real-world usage and studio presentation',
    previewImage: 'https://images.unsplash.com/photo-1485848395967-65dff62dc35b?q=80&w=1769&auto=format&fit=crop',
    demoGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXoxbGw4MTV5MHF5bWI3eGRwejhteHBzczMzcGtwbTlvdnFsMGxvdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lRjF3UxYgQ1VlDjqrG/giphy.gif',
    beforeImage: 'https://images.unsplash.com/photo-1572635196184-84e35138cf62?q=80&w=1780&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1780&auto=format&fit=crop',
    highlights: [
      'Real-world environments',
      'Human interaction',
      'Lifestyle integration',
      'Aspirational context'
    ],
    prompt: `[Lifestyle + studio blend, cinematic product demo] The {productName} {productType} is shown in real-world use: [handheld, worn, or placed] by a person in a stylish environment. [Match cut] Transition to a studio shot with controlled lighting to highlight the product's design. [Slow motion details] Focus on material, buttons, or mechanisms. [Final scene] Returns to lifestyle use, capturing aspirational mood and brand feel.`
  },
  {
    id: 4,
    title: 'Macro Detail',
    icon: <ZoomIn className="h-5 w-5 text-[#bcee45]" />,
    description: 'Ultra-close focus on textures and fine details',
    previewImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1770&auto=format&fit=crop',
    demoGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTVieGc2eXJpOGNkNzE5cnQ0djA3NHp0YTNnN3Z2YzBnZnNlMXk5cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JtwMHJqnLFWZnvLZlH/giphy.gif',
    beforeImage: 'https://images.unsplash.com/photo-1513116476489-7635e79feb27?q=80&w=1784&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1562184552-997c461abbe6?q=80&w=1776&auto=format&fit=crop',
    highlights: [
      'Extreme close-up shots',
      'Texture emphasis',
      'Surface detail focus',
      'Depth of field effects'
    ],
    prompt: `[Macro cinematic shots, texture focus] The camera glides ultra-close over the {productType} "{productName}". [Raking light] brings out fine surface details like stitching, metal grain, or embossing. [Shallow depth of field] blurs the background for an intimate feel. [Slow pan and tilt] across logos, buttons, and edge profiles. [Final pullback] reveals the full product glowing under soft studio lights.`
  },
  {
    id: 5,
    title: 'Liquid Interaction',
    icon: <Droplets className="h-5 w-5 text-[#bcee45]" />,
    description: 'Dynamic water effects and slow-motion splashes',
    previewImage: 'https://images.unsplash.com/photo-1586489797156-0c45c5065ac0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8RHluYW1pYyUyMHdhdGVyJTIwZWZmZWN0cyUyMGFuZCUyMHNsb3clMjBtb3Rpb24lMjBzcGxhc2hlc3xlbnwwfHwwfHx8MA%3D%3D',
    demoGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnp0MXN2cjk5ZzN2c2ZhemdtZmx2NmVvajhnYnd6dW8yc3dwcjl4aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WgQer2OiKABLG/giphy.gif',
    beforeImage: 'https://images.unsplash.com/photo-1514695343908-1492a45ddd5a?q=80&w=1740&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1588414734732-660b07304ddb?q=80&w=1771&auto=format&fit=crop',
    highlights: [
      'Slow-motion water effects',
      'Dynamic splash interaction',
      'Droplet formations',
      'Water-resistance showcase'
    ],
    prompt: `[Liquid dynamics, cinematic splash effects] The {productType} "{productName}" is placed in a studio where water droplets or mist interact with it. [High-speed camera] captures droplets splashing off surfaces in slow motion. [Macro lens] focuses on water beading and rolling over textures. [Final wide shot] shows the product standing resilient, with droplets glistening under dramatic lighting.`
  },
 
];

// Animation variants
const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 30px rgba(188, 238, 69, 0.15)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function PromptSelector({ onSelectPrompt, productType, productName }: { onSelectPrompt: any, productType: any, productName: any }) {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  
  // Ambient glow animation
  const glowControls = useAnimation();
  
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

  const handleSelectPrompt = (id: any) => {
    setSelectedPrompt(id);
    const style = videoStyles.find(style => style.id === id);
    const prompt = style?.prompt
      .replace(/{productType}/g, productType || 'product')
      .replace(/{productName}/g, productName || 'product');
    onSelectPrompt(prompt, style?.title);
  };
  
  const toggleExpand = (id: any, e: any) => {
    e.stopPropagation();
    setExpandedCard(expandedCard === id ? null : id);
    setIsPlaying(false);
  };
  
  const togglePlay = (e: any) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        (videoRef.current as HTMLVideoElement).pause();
      } else {
        (videoRef.current as HTMLVideoElement).play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Animated background glow */}
      <motion.div 
        animate={glowControls}
        className="absolute top-20 left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30 pointer-events-none"
      ></motion.div>
      <motion.div 
        animate={glowControls}
        className="absolute bottom-20 right-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30 pointer-events-none"
      ></motion.div>
      
      <h3 className="text-base font-medium text-white flex items-center">
        <Clapperboard className="h-5 w-5 mr-2 text-[#bcee45]" />
        Select a Cinematic Style for Your Product
      </h3>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {videoStyles.map((style) => (
          <motion.div
            key={style.id}
            variants={cardVariants}
            whileHover={expandedCard === style.id ? {} : "hover"}
            className="h-full"
          >
            <Card
              className={`cursor-pointer h-full border transition-all duration-300 overflow-hidden ${
                selectedPrompt === style.id 
                  ? 'border-[#bcee45] ring-2 ring-[#bcee45]/20 shadow-[0_0_15px_rgba(188,238,69,0.2)]' 
                  : 'border-[#323232] hover:border-[#bcee45]/30'
              } ${
                expandedCard === style.id ? 'scale-105 z-20 relative' : ''
              } bg-gradient-to-br from-[#1a1a1a]/90 to-[#161616]/90 backdrop-blur-sm`}
              onClick={() => handleSelectPrompt(style.id)}
            >
              <div className="p-0">
                {/* Main Card View */}
                <div className={`overflow-hidden relative ${expandedCard === style.id ? 'aspect-video' : 'h-48'}`}>
                  {expandedCard === style.id ? (
                    // Expanded view shows animated GIF
                    <div className="relative h-full">
                      <img 
                        src={style.demoGif} 
                        alt={style.title} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute bottom-4 right-4 bg-[#161616]/80 border border-[#323232] hover:border-[#bcee45]/50 p-2 rounded-full text-white"
                        onClick={togglePlay}
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    // Collapsed view shows static image
                    <img 
                      src={style.previewImage} 
                      alt={style.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  )}
                  
                  {/* Icon badge overlay */}
                  <div className="absolute top-3 left-3 bg-[#161616]/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1 border border-[#323232] z-20">
                    <div className="p-1.5 rounded-full bg-[#bcee45]">
                      {React.cloneElement(style.icon, { className: 'h-3.5 w-3.5 text-[#161616]' })}
                    </div>
                    <span className="ml-1 text-white">{style.title}</span>
                  </div>
                  
                  {/* Expand/Collapse button */}
                  <button
                    className="absolute top-3 right-3 bg-[#161616]/80 border border-[#323232] hover:border-[#bcee45]/50 p-1.5 rounded-full text-white z-30"
                    onClick={(e) => toggleExpand(style.id, e)}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  
                  {/* Selection indicator */}
                  {selectedPrompt === style.id && (
                    <div className="absolute bottom-3 left-3 bg-[#bcee45] text-[#161616] rounded-full p-1.5 flex items-center">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#161616] to-transparent"></div>
                </div>
                
                {/* Card info section */}
                <div className="p-4">
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    {style.description}
                  </p>
                  
                  {/* Expanded details */}
                  <AnimatePresence>
                    {expandedCard === style.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        {/* Before/After comparison */}
                        <div className="space-y-2">
                          <p className="text-xs text-[#bcee45] uppercase tracking-widest">Transformation Preview</p>
                          
                          <div className="flex items-center justify-between space-x-2 bg-[#161616] p-2 rounded-lg">
                            <div className="w-5/12 aspect-square rounded-md overflow-hidden relative">
                              <img 
                                src={style.beforeImage} 
                                alt="Before" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-[#161616]/80 py-1 text-xs text-center text-white">
                                Before
                              </div>
                            </div>
                            
                            <ArrowRight className="h-5 w-5 text-[#bcee45]" />
                            
                            <div className="w-5/12 aspect-square rounded-md overflow-hidden relative">
                              <img 
                                src={style.afterImage} 
                                alt="After" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-[#161616]/80 py-1 text-xs text-center text-white">
                                After
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Key features list */}
                        <div>
                          <p className="text-xs text-[#bcee45] uppercase tracking-widest mb-2">Key Features</p>
                          <div className="grid grid-cols-2 gap-2">
                            {style.highlights.map((highlight, index) => (
                              <div key={index} className="flex items-start text-xs text-gray-400">
                                <div className="min-w-5 mt-0.5 mr-1.5">
                                  <div className="h-3 w-3 rounded-full bg-[#bcee45]/20 flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#bcee45]"></div>
                                  </div>
                                </div>
                                {highlight}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Action button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPrompt(style.id);
                          }}
                          className={`w-full mt-2 bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium ${
                            selectedPrompt === style.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={selectedPrompt === style.id}
                        >
                          {selectedPrompt === style.id ? (
                            <span className="flex items-center justify-center">
                              <Check className="mr-2 h-4 w-4" />
                              Style Selected
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <Clapperboard className="mr-2 h-4 w-4" />
                              Select This Style
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}