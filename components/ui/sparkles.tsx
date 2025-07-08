// components/ui/sparkles.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface SparkleProps {
  size: number;
  color: string;
  style: React.CSSProperties;
}

const Sparkle = ({ size, color, style }: SparkleProps) => {
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180],
    });
  }, [controls]);
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        position: "absolute",
        ...style,
      }}
      animate={controls}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 3,
      }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </motion.svg>
  );
};

export const Sparkles: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; size: number; color: string; style: React.CSSProperties }>>([]);
  
  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = [];
      const colors = ["#8B5CF6", "#EC4899", "#3B82F6"];
      
      for (let i = 0; i < 12; i++) {
        newSparkles.push({
          id: i,
          size: Math.random() * 20 + 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          style: {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 20,
          },
        });
      }
      
      setSparkles(newSparkles);
    };
    
    generateSparkles();
  }, []);
  
  return (
    <div className="relative">
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          size={sparkle.size}
          color={sparkle.color}
          style={sparkle.style}
        />
      ))}
      {children}
    </div>
  );
};
