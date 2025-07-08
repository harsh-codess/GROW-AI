"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, Target, Users, Rocket, BarChart, DollarSign, Zap, CheckCircle } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  category: string;
  tasks: string[];
  resources: string[];
  metrics: string[];
}

interface PlanTimelineProps {
  timelineData: TimelineItem[];
}

export function PlanTimeline({ timelineData }: PlanTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Category icons
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "marketing":
        return <Target className="h-4 w-4 text-[#161616]" />;
      case "product":
        return <Rocket className="h-4 w-4 text-[#161616]" />;
      case "customer":
        return <Users className="h-4 w-4 text-[#161616]" />;
      case "financial":
        return <DollarSign className="h-4 w-4 text-[#161616]" />;
      case "operations":
        return <BarChart className="h-4 w-4 text-[#161616]" />;
      default:
        return <Calendar className="h-4 w-4 text-[#161616]" />;
    }
  };

  // Category colors
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "marketing":
        return "bg-[#22d3ee]";
      case "product":
        return "bg-[#bcee45]";
      case "customer":
        return "bg-[#a78bfa]";
      case "financial":
        return "bg-[#f97316]";
      case "operations":
        return "bg-[#f472b6]";
      default:
        return "bg-[#bcee45]";
    }
  };

  // Check if there's data to display
  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="p-4 rounded-full bg-[#232323] mb-4">
          <Calendar className="h-8 w-8 text-[#bcee45]" />
        </div>
        <p className="mb-2">No timeline data available</p>
        <p className="text-sm text-gray-500 max-w-md text-center">
          Once your business plan is generated, a strategic timeline will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line connecting timeline items */}
      <div className="absolute left-16 top-8 bottom-8 w-0.5 bg-[#323232] z-0"></div>
      
      <div className="space-y-6">
        {timelineData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start relative">
              {/* Timeline node */}
              <div className={`h-8 w-8 rounded-full ${getCategoryColor(item.category)} flex items-center justify-center flex-shrink-0 z-10 mt-2 mx-4 shadow-lg transition-transform hover:scale-110`}>
                {getCategoryIcon(item.category)}
              </div>
              
              {/* Content card */}
              <Card className="flex-grow border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl overflow-hidden relative group hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all">
                {/* Animated corner piece */}
                <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(item.category)} bg-opacity-20 text-${getCategoryColor(item.category).replace('bg-', '')}`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400">{item.timeframe}</span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleItem(item.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-[#bcee45] hover:bg-[#232323]"
                    >
                      {expandedItems[item.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mt-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                  
                  {expandedItems[item.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-4"
                    >
                      {/* Tasks */}
                      {item.tasks && item.tasks.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-[#bcee45]" />
                            Key Tasks
                          </h4>
                          <ul className="space-y-1 pl-6 list-disc marker:text-[#bcee45]">
                            {item.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="text-sm text-gray-400">
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Resources */}
                      {item.resources && item.resources.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-[#bcee45]" />
                            Required Resources
                          </h4>
                          <ul className="space-y-1 pl-6 list-disc marker:text-[#bcee45]">
                            {item.resources.map((resource, resourceIndex) => (
                              <li key={resourceIndex} className="text-sm text-gray-400">
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Metrics */}
                      {item.metrics && item.metrics.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white flex items-center">
                            <BarChart className="h-4 w-4 mr-2 text-[#bcee45]" />
                            Success Metrics
                          </h4>
                          <ul className="space-y-1 pl-6 list-disc marker:text-[#bcee45]">
                            {item.metrics.map((metric, metricIndex) => (
                              <li key={metricIndex} className="text-sm text-gray-400">
                                {metric}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}