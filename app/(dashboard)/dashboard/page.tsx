// app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  MessageSquare, 
  Image as ImageIcon, 
  FileText, 
  ArrowUpRight,
  Plus,
  Zap,
  TrendingUp,
  ChevronDown,
  Filter,
  RefreshCw,
  Phone,
  Sparkles,
  Flame,
  Code,
  Terminal,
  BrainCircuit,
  LineChart as LineChartIcon,
  BatteryCharging,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, RadialBarChart, RadialBar, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

interface DashboardStat {
  title: string;
  value: string;
  trend: number;
  icon?: React.ReactNode;
  iconBg?: string;
}

interface ChartDataPoint {
  name: string;
  views: number;
  engagement: number;
  conversion: number;
}

interface ContentDistribution {
  name: string;
  value: number;
  color: string;
}

interface TopContentItem {
  id: string;
  title: string;
  date: string;
  comments: number;
  engagement: number;
  icon: string;
  iconBg: string;
  type: string;
  author: string;
}

interface Recommendation {
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
}

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingDistribution, setIsLoadingDistribution] = useState(false);
  const [isLoadingTopContent, setIsLoadingTopContent] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  const [timeRange, setTimeRange] = useState("weekly");
  const [contentType, setContentType] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("views");
  
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [contentDistribution, setContentDistribution] = useState<ContentDistribution[]>([]);
  const [topContent, setTopContent] = useState<TopContentItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  

  const router=useRouter()
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();

  // Icons mapped to stats
  const statsIcons = {
    "Content Created": <FileText className="h-5 w-5 text-[#161616]" />,
    "AI Conversations": <BrainCircuit className="h-5 w-5 text-[#161616]" />,
    "Images Generated": <ImageIcon className="h-5 w-5 text-[#161616]" />,
    "Marketing Score": <BarChart className="h-5 w-5 text-[#161616]" />
  };

  const statsIconBgs = {
    "Content Created": "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    "AI Conversations": "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    "Images Generated": "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    "Marketing Score": "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]"
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoaded(true);
      await Promise.all([
        fetchStats(),
        fetchChartData(),
        fetchContentDistribution(),
        fetchTopContent(),
        fetchRecommendations()
      ]);
    };
    
    fetchAllData();
    
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
  }, []);
  
  useEffect(() => {
    fetchStats();
  }, [timeRange]);
  
  useEffect(() => {
    fetchChartData();
  }, [timeRange, selectedMetric]);
  
  useEffect(() => {
    fetchContentDistribution();
  }, [contentType]);
  
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      // Simulated stats data for the demo
      const simulatedStats = [
        { title: "Content Created", value: "128", trend: 24 },
        { title: "AI Conversations", value: "2,547", trend: 12 },
        { title: "Images Generated", value: "357", trend: -8 },
        { title: "Marketing Score", value: "92%", trend: 5 }
      ];
      
      // Add icons to stats
    
      
      
     
      const response = await axios.get(`/api/dashboard/stats?timeRange=${timeRange}`);
      
      // Add icons to stats
      const statsWithIcons = response.data.stats.map((stat: DashboardStat) => ({
        ...stat,
        icon: statsIcons[stat.title as keyof typeof statsIcons],
        iconBg: statsIconBgs[stat.title as keyof typeof statsIconBgs]
      }));
      
      setStats(statsWithIcons);
      
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };
  
  const fetchChartData = async () => {
    setIsLoadingChart(true);
    try {
      // Simulated chart data for the demo
      const simulatedData = [
        { name: "Mon", views: 5000, engagement: 3400, conversion: 2400 },
        { name: "Tue", views: 4200, engagement: 3800, conversion: 2800 },
        { name: "Wed", views: 6800, engagement: 4200, conversion: 3200 },
        { name: "Thu", views: 5800, engagement: 3900, conversion: 2900 },
        { name: "Fri", views: 7200, engagement: 4400, conversion: 3600 },
        { name: "Sat", views: 8200, engagement: 5400, conversion: 3900 },
        { name: "Sun", views: 9000, engagement: 5800, conversion: 4200 }
      ];
      
      setChartData(simulatedData);
      
    
      const response = await axios.get(`/api/dashboard/chart?timeRange=${timeRange}&metric=${selectedMetric}`);
      setChartData(response.data.chartData);
    
    } catch (error) {
      console.error("Error fetching chart data:", error);
      toast.error("Failed to load chart data");
    } finally {
      setIsLoadingChart(false);
    }
  };
  
  const fetchContentDistribution = async () => {
    setIsLoadingDistribution(true);
    try {
      // Simulated distribution data for the demo
      const simulatedData = [
        { name: "Blog Posts", value: 35, color: "#bcee45" },
        { name: "Social Media", value: 25, color: "#22d3ee" },
        { name: "Email", value: 15, color: "#818cf8" },
        { name: "Video", value: 25, color: "#f472b6" }
      ];
      
      setContentDistribution(simulatedData);
      
    
      const response = await axios.get(`/api/dashboard/content-distribution?contentType=${contentType}`);
      setContentDistribution(response.data.distributionData);
      
    } catch (error) {
      console.error("Error fetching content distribution:", error);
      toast.error("Failed to load content distribution data");
    } finally {
      setIsLoadingDistribution(false);
    }
  };
  
  const fetchTopContent = async () => {
    setIsLoadingTopContent(true);
    try {
      // Simulated top content data for the demo
      const simulatedData = [
        { 
          id: "1", 
          title: "10 AI Marketing Strategies for 2025", 
          date: "May 1, 2025", 
          comments: 24, 
          engagement: 78, 
          icon: "FileText", 
          iconBg: "bg-[#bcee45]", 
          type: "blog", 
          author: "Emma Wilson" 
        },
        { 
          id: "2", 
          title: "Product Launch Campaign Analysis", 
          date: "April 28, 2025", 
          comments: 18, 
          engagement: 65, 
          icon: "MessageSquare", 
          iconBg: "bg-[#22d3ee]", 
          type: "report", 
          author: "Alex Johnson" 
        },
        { 
          id: "3", 
          title: "Summer Collection Email Campaign", 
          date: "April 25, 2025", 
          comments: 32, 
          engagement: 81, 
          icon: "Mail", 
          iconBg: "bg-[#f472b6]", 
          type: "email", 
          author: "Michael Chen" 
        }
      ];
      
      setTopContent(simulatedData);
  
      const response = await axios.get('/api/dashboard/top-content');
      setTopContent(response.data.topContent);
      
    } catch (error) {
      console.error("Error fetching top content:", error);
      toast.error("Failed to load top performing content");
    } finally {
      setIsLoadingTopContent(false);
    }
  };
  
  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      // Simulated recommendations data for the demo
      const simulatedData = [
        { 
          title: "Increase social media engagement", 
          description: "Schedule posts during peak hours based on audience data", 
          bgColor: "#bcee45", 
          borderColor: "#9bc42c" 
        },
        { 
          title: "Optimize email subject lines", 
          description: "Use AI to test variations and improve open rates", 
          bgColor: "#22d3ee", 
          borderColor: "#0ea5e9" 
        },
        { 
          title: "Create more video content", 
          description: "Video engagement is 40% higher than other content types", 
          bgColor: "#f472b6", 
          borderColor: "#ec4899" 
        }
      ];
      
      setRecommendations(simulatedData);
      
     
      const response = await axios.get('/api/dashboard/recommendations');
      setRecommendations(response.data.recommendations);
      
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to load AI recommendations");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Get the appropriate icon component for top content
  const getContentIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="h-4 w-4 text-[#161616]" />;
      case 'MessageSquare':
        return <BrainCircuit className="h-4 w-4 text-[#161616]" />;
      case 'Mail':
        return <Zap className="h-4 w-4 text-[#161616]" />;
      default:
        return <FileText className="h-4 w-4 text-[#161616]" />;
    }
  };

  // Custom gradient for charts
  const gradientOffset = () => {
    const dataMax = Math.max(...chartData.map((i) => i[selectedMetric as keyof ChartDataPoint] as number));
    const dataMin = Math.min(...chartData.map((i) => i[selectedMetric as keyof ChartDataPoint] as number));
    
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
    return dataMax / (dataMax - dataMin);
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
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
        
        {/* Code matrix effect */}
        <div className="matrix-rain"></div>
      </div>
      
      <motion.div 
        className="flex flex-col space-y-6 text-gray-200 min-h-screen px-4 sm:px-6 py-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mr-3 h-8 w-8 rounded-md bg-[#bcee45] flex items-center justify-center">
                <Terminal className="h-4 w-4 text-[#161616]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Command <span className="text-[#bcee45]">Center</span>
              </h1>
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="text-gray-400 ml-11">Your marketing intelligence dashboard</p>
              {/* Typewriter blinking cursor effect */}
              <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-2 h-4 bg-[#bcee45] animate-blink"></div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex gap-2"
          >
            <div className="bg-[#1a1a1a] border border-[#323232] rounded-lg px-2 py-1 text-xs text-gray-400 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-[#bcee45] mr-2 animate-pulse"></span>
              SYSTEM ONLINE
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px] bg-[#1a1a1a] border-[#323232] text-gray-300 h-9">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#323232] text-gray-300">
                <SelectItem value="weekly">Last 7 days</SelectItem>
                <SelectItem value="monthly">Last 30 days</SelectItem>
                <SelectItem value="yearly">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={()=>{
              router.push("/dashboard/photoshoot")
            }} className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group h-9">
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <Plus className="mr-2 h-4 w-4 relative z-10" />
              <span className="relative z-10">New Project</span>
            </Button>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoadingStats ? (
            Array(4).fill(0).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
              >
                <Card className="border-[#323232] bg-[#1a1a1a]/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-5 w-24 bg-[#232323] rounded animate-pulse"></div>
                    <div className="h-8 w-8 rounded-full bg-[#232323] animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-[#232323] rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-36 bg-[#232323] rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
                  {/* Glowing border effect on hover */}
                  <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                  
                  {/* Animated corner piece */}
                  <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
                  </div>
                  
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      {stat.title}
                    </CardTitle>
                    <div className={`rounded-md p-2 ${stat.iconBg} group-hover:shadow-lg group-hover:shadow-[#bcee45]/20 transition-all`}>
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="flex items-center text-xs mt-1">
                      <span className={`flex items-center ${stat.trend > 0 ? 'text-[#bcee45]' : stat.trend < 0 ? 'text-rose-400' : 'text-gray-500'}`}>
                        {stat.trend > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : stat.trend < 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
                        ) : (
                          <div className="w-3 h-3 mr-1"></div>
                        )}
                        {stat.trend === 0 ? "No change" : `${Math.abs(stat.trend)}%`}
                      </span>
                      <span className="ml-1 text-gray-500">vs last {timeRange === "weekly" ? "week" : timeRange === "monthly" ? "month" : "year"}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Performance Charts */}
        <div className="grid gap-6 md:grid-cols-1">
          <motion.div 
            className="col-span-full md:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
              
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <LineChartIcon className="h-4 w-4 mr-2 text-[#bcee45]" />
                      Performance Metrics
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Content engagement analytics
                    </CardDescription>
                  </div>
                  <Tabs 
                    defaultValue="views" 
                    value={selectedMetric}
                    onValueChange={setSelectedMetric}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="grid w-full grid-cols-3 bg-[#232323] p-1">
                      <TabsTrigger value="views" className="text-white data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
                        Views
                      </TabsTrigger>
                      <TabsTrigger value="engagement" className="text-white data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
                        Engagement
                      </TabsTrigger>
                      <TabsTrigger value="conversion" className="text-white data-[state=active]:bg-[#bcee45] data-[state=active]:text-[#161616]">
                        Conversion
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingChart ? (
                  <div className="h-[240px] flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="h-[240px] pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#bcee45" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#bcee45" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#bcee45" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#bcee45" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#bcee45" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#bcee45" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                        <YAxis tick={{ fill: '#9ca3af' }} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(26, 26, 26, 0.9)', 
                            border: '1px solid #323232',
                            borderRadius: '6px',
                            color: '#e5e7eb',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }} 
                          itemStyle={{ color: '#e5e7eb' }}
                          labelStyle={{ color: '#e5e7eb' }}
                        />
                        <Area
                          type="monotone" 
                          dataKey={selectedMetric} 
                          stroke="#bcee45" 
                          strokeWidth={2}
                          fillOpacity={1}
                          fill={`url(#color${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)})`}
                          activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[240px] flex items-center justify-center flex-col">
                    <p className="text-gray-500">No data available for this time period</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 border-[#323232] text-gray-400 hover:bg-[#232323]"
                      onClick={fetchChartData}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
              
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <BatteryCharging className="h-4 w-4 mr-2 text-[#bcee45]" />
                      Top Performing Content
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Highest engagement assets
                    </CardDescription>
                  </div>
                  
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTopContent ? (
                  <div className="space-y-4">
                    {Array(4).fill(0).map((_, index) => (
                      <div key={`skeleton-${index}`} className="flex items-start justify-between border-b border-[#323232] pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-[#232323] rounded-md animate-pulse"></div>
                          <div>
                            <div className="h-4 w-48 bg-[#232323] rounded animate-pulse mb-2"></div>
                            <div className="h-3 w-24 bg-[#232323] rounded animate-pulse mb-2"></div>
                            <div className="h-3 w-36 bg-[#232323] rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="w-16 h-8 bg-[#232323] rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : topContent.length > 0 ? (
                  <div className="space-y-4">
                    {topContent.map((item, index) => (
                      <div key={index} className="flex items-start justify-between border-b border-[#323232] pb-4 last:border-0 last:pb-0 group/item hover:bg-[#232323]/30 rounded-lg transition-all p-2 -mx-2">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-md ${item.iconBg} mt-1 group-hover/item:shadow-md group-hover/item:shadow-[#bcee45]/10 transition-all`}>
                            {getContentIcon(item.icon)}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-white group-hover/item:text-[#bcee45] transition-colors">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                            <div className="flex items-center mt-1 space-x-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <MessageSquare className="h-3 w-3 mr-1 text-gray-500" />
                                {item.comments}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Zap className="h-3 w-3 mr-1 text-gray-500" />
                                {item.engagement}%
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white hover:bg-[#232323]">
                          <span className="flex items-center">
                            View
                            <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-500 mb-4">No content available yet</p>
                    <Link href="/dashboard/video">
                      <Button size="sm" className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Content
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
              
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <BrainCircuit className="h-4 w-4 mr-2 text-[#bcee45]" />
                      AI Recommendations
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Optimization insights
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchRecommendations}
                    disabled={isLoadingRecommendations}
                    className="border-[#323232] bg-[#bcee45] text-[#161616] hover:bg-[#232323] h-9"
                  >
                    {isLoadingRecommendations ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="flex items-center ">
                        <span className="mr-1 ">Analyze</span>
                        <Code className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingRecommendations ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, index) => (
                      <div key={`skeleton-${index}`} className="rounded-lg p-4 bg-[#232323]/50 border border-[#323232]">
                        <div className="h-4 w-36 bg-[#2a2a2a] rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-full bg-[#2a2a2a] rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((suggestion, index) => (
                      <div 
                        key={index} 
                        className="rounded-lg p-4 relative bg-[#232323]/30 border border-[#323232] flex justify-between items-center hover:bg-[#232323]/50 hover:border-[#bcee45]/20 transition-all overflow-hidden group/rec"
                      >
                        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover/rec:opacity-100 transition-opacity"></div>
                        
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-white group-hover/rec:text-[#bcee45] transition-colors">{suggestion.title}</p>
                          <p className="text-xs text-gray-400">{suggestion.description}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0 text-gray-400 hover:text-white hover:bg-[#232323]">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-500 mb-4">No recommendations available</p>
                    <Button 
                      size="sm"
                      onClick={fetchRecommendations}
                      className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Insights
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          {quickActions.map((action, index) => (
            <Card key={index} className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#1a1a1a]/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg shadow-black/20 group hover:shadow-[#bcee45]/5 transition-all">
              <Link href={action.href}>
                <CardContent className="p-0">
                  <div className="relative overflow-hidden h-full">
                    {/* Cyberpunk slash line background */}
                    <div className="absolute -right-2 top-0 w-1 h-16 bg-[#bcee45]/20 rotate-45 transform origin-top-right"></div>
                    <div className="absolute -left-2 bottom-0 w-1 h-16 bg-[#bcee45]/20 rotate-45 transform origin-bottom-left"></div>
                    
                    {/* Animated highlight */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#bcee45]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    
                    <div className="p-6 flex gap-4 items-start relative z-10">
                      <div className={`rounded-lg p-2.5 ${action.iconBg} shadow-lg group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="bg-[#232323] px-2 py-0.5 text-[9px] text-[#bcee45] uppercase tracking-wider rounded mb-1 font-semibold">
                          AI Tool
                        </div>
                        <h3 className="font-medium text-white mb-1 group-hover:text-[#bcee45] transition-colors">{action.title}</h3>
                        <p className="text-xs text-gray-400">{action.description}</p>
                        
                        {/* Animated arrow on hover */}
                        <div className="mt-3 flex items-center text-[#bcee45] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Launch</span>
                          <ArrowUpRight className="ml-1 h-3 w-3 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </motion.div>

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
          
          .matrix-rain {
            position: absolute;
            inset: 0;
            overflow: hidden;
            opacity: 0.03;
            z-index: -1;
          }

          .matrix-rain::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='0' y='10' fill='%23bcee45'%3E01%3C/text%3E%3Ctext x='20' y='30' fill='%23bcee45'%3E10%3C/text%3E%3Ctext x='40' y='50' fill='%23bcee45'%3E01%3C/text%3E%3Ctext x='60' y='70' fill='%23bcee45'%3E10%3C/text%3E%3Ctext x='80' y='90' fill='%23bcee45'%3E01%3C/text%3E%3C/svg%3E");
            animation: matrix-fall 20s linear infinite;
          }

          @keyframes matrix-fall {
            from {
              background-position: 0 0;
            }
            to {
              background-position: 0 1000px;
            }
          }
        `}</style>
      </motion.div>
    </div>
  );
}

// Quick actions with enhanced cyberpunk styling
const quickActions = [
  {
    title: "AI Product Photoshoot",
    description: "Transform regular photos into professional marketing images",
    icon: <ImageIcon className="h-5 w-5 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c] group-hover:from-[#dcff65] group-hover:to-[#bcee45]",
    href: "/dashboard/photoshoot",
  },
  {
    title: "Neural Copywriter",
    description: "Generate engaging copy for your marketing campaigns",
    icon: <BrainCircuit className="h-5 w-5 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c] group-hover:from-[#dcff65] group-hover:to-[#bcee45]",
    href: "/dashboard/chat",
  },
  {
    title: "Voice Sales Agent",
    description: "Configure AI phone agents to handle customer calls",
    icon: <Phone className="h-5 w-5 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c] group-hover:from-[#dcff65] group-hover:to-[#bcee45]",
    href: "/dashboard/voice-agent",
  },
  {
    title: "Content Generator",
    description: "Create blogs, social posts and marketing materials",
    icon: <Zap className="h-5 w-5 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c] group-hover:from-[#dcff65] group-hover:to-[#bcee45]",
    href: "/dashboard/content",
  },
];