"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, FileText, Calendar, Clock, Archive } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface BusinessPlan {
  id: string;
  name: string;
  planData: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PlanListProps {
  onSelectPlan: (plan: BusinessPlan) => void;
  onNewPlan: () => void;
}

export function PlanList({ onSelectPlan, onNewPlan }: PlanListProps) {
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard/business-planner');
        if (response.data) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error("Error fetching business plans:", error);
        toast.error("Failed to load your business plans", {
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

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="h-10 w-10 border-4 border-[#bcee45]/20 border-t-[#bcee45] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Loading your business plans...</p>
      </div>
    );
  }

  return (
    <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
      
      <CardHeader className="border-b border-[#323232] flex flex-row justify-between items-center">
        <CardTitle className="text-white">Your Business Plans</CardTitle>
        <Button 
          onClick={onNewPlan} 
          className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium relative overflow-hidden group"
        >
          <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          <span className="relative z-10 flex items-center">
            Create New Plan
            <ChevronRight className="ml-2 h-4 w-4" />
          </span>
        </Button>
      </CardHeader>
      
      <CardContent className="pt-6">
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <FileText className="h-16 w-16 text-[#323232]" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No business plans yet</h3>
            <p className="text-gray-400 mb-6">Create your first business plan to get started</p>
            <Button 
              onClick={onNewPlan} 
              className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium"
            >
              Create Your First Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div 
                  className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] hover:border-[#bcee45]/30 transition-all cursor-pointer"
                  onClick={() => onSelectPlan(plan)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">{plan.name}</h3>
                      <div className="flex items-center space-x-4 text-gray-400 text-xs">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-[#bcee45]/70" />
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-[#bcee45]/70" />
                          {formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          plan.status === 'active' ? 'bg-[#bcee45]/10 text-[#bcee45]' : 
                          plan.status === 'archived' ? 'bg-gray-500/10 text-gray-400' : 
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}