"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Instagram, 
  Youtube, 
  Linkedin, 
  RefreshCw,
  Users,
  BarChart2,
  RefreshCcw,
  Loader2,
  LayoutDashboard
} from "lucide-react";
import InstagramConnect from "@/components/dashboard/socials/instagram-connect";
import YouTubeConnect from "@/components/dashboard/socials/youtube-connect";
import LinkedInConnect from "@/components/dashboard/socials/linkedin-connect";
import SocialOverview from "@/components/dashboard/socials/social-overview";
import axios from "axios";

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

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connections, setConnections] = useState({
    youtube: { isConnected: false, username: null, lastFetch: null },
    instagram: { isConnected: false, username: null, lastFetch: null },
    linkedin: { isConnected: false, username: null, lastFetch: null }
  });
  
  // States for platform data
  const [youtubeData, setYoutubeData] = useState(null);
  const [instagramData, setInstagramData] = useState(null);
  const [linkedinData, setLinkedinData] = useState(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/social/connections');
      setConnections(response.data.data);
      
      // Fetch data for connected platforms
      if (response.data.data.youtube.isConnected) {
        fetchYoutubeData();
      }
      if (response.data.data.instagram.isConnected) {
        fetchInstagramData();
      }
      if (response.data.data.linkedin.isConnected) {
        fetchLinkedinData();
      }
    } catch (error) {
      console.error("Error fetching social connections:", error);
      toast.error("Failed to load social connections");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchYoutubeData = async (forceRefresh = false) => {
    try {
      const response = await axios.get(`/api/social/youtube/data?force=${forceRefresh}`);
      setYoutubeData(response.data.data);
    } catch (error) {
      console.error("Error fetching YouTube data:", error);
      if (error.response?.status === 404) {
        // Not connected yet, just ignore
      } else {
        toast.error("Failed to load YouTube data");
      }
    }
  };

  const fetchInstagramData = async (forceRefresh = false) => {
    try {
      const response = await axios.get(`/api/social/instagram/data?force=${forceRefresh}`);
      setInstagramData(response.data.data);
    } catch (error) {
      console.error("Error fetching Instagram data:", error);
      if (error.response?.status === 404) {
        // Not connected yet, just ignore
      } else {
        toast.error("Failed to load Instagram data");
      }
    }
  };

  const fetchLinkedinData = async (forceRefresh = false) => {
    try {
      const response = await axios.get(`/api/social/linkedin/data?force=${forceRefresh}`);
      setLinkedinData(response.data.data);
    } catch (error) {
      console.error("Error fetching LinkedIn data:", error);
      if (error.response?.status === 404) {
        // Not connected yet, just ignore
      } else {
        toast.error("Failed to load LinkedIn data");
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchConnections();
      toast.success("Social data refreshed");
    } catch (error) {
      toast.error("Failed to refresh social data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnect = async (platform) => {
    toast.success(`${platform} connected successfully`);
    await fetchConnections(); // Refresh connections
  };

  const handleDisconnect = async (platform) => {
    try {
      await axios.delete('/api/social/connections', {
        data: { platform }
      });
      toast.success(`${platform} disconnected successfully`);
      
      // Reset data for the disconnected platform
      if (platform === 'youtube') {
        setYoutubeData(null);
      } else if (platform === 'instagram') {
        setInstagramData(null);
      } else if (platform === 'linkedin') {
        setLinkedinData(null);
      }
      
      // Refresh connections
      await fetchConnections();
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      toast.error(`Failed to disconnect ${platform}`);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Analytics</h1>
          <p className="text-muted-foreground">
            Connect your social accounts to view analytics and insights
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="youtube" className="flex items-center">
            <Youtube className="mr-2 h-4 w-4" />
            YouTube
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center">
            <Instagram className="mr-2 h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex items-center">
            <Linkedin className="mr-2 h-4 w-4" />
            LinkedIn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Youtube className="mr-2 h-5 w-5 text-red-500" />
                    YouTube
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <SocialOverview
                      platform="youtube"
                      data={youtubeData}
                      isConnected={connections.youtube.isConnected}
                      onSwitchTab={() => setActiveTab("youtube")}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Instagram className="mr-2 h-5 w-5 text-pink-500" />
                    Instagram
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <SocialOverview
                      platform="instagram"
                      data={instagramData}
                      isConnected={connections.instagram.isConnected}
                      onSwitchTab={() => setActiveTab("instagram")}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Linkedin className="mr-2 h-5 w-5 text-blue-500" />
                    LinkedIn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <SocialOverview
                      platform="linkedin"
                      data={linkedinData}
                      isConnected={connections.linkedin.isConnected}
                      onSwitchTab={() => setActiveTab("linkedin")}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {!connections.youtube.isConnected && 
                       !connections.instagram.isConnected && 
                       !connections.linkedin.isConnected ? (
                        <div className="text-center py-10 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Connect your social accounts to view audience insights</p>
                          <Button 
                            variant="default" 
                            className="mt-4"
                            onClick={() => setActiveTab("youtube")}
                          >
                            Connect Accounts
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-center p-6 border rounded-md border-dashed">
                            <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                            <p className="text-lg font-medium">Platform Demographics</p>
                            <p className="text-sm text-muted-foreground">
                              Coming soon
                            </p>
                          </div>
                          <div className="text-center p-6 border rounded-md border-dashed">
                            <Users className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                            <p className="text-lg font-medium">Total Audience</p>
                            <p className="text-sm text-muted-foreground">
                              Coming soon
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="youtube" className="pt-4">
          <YouTubeConnect
            onConnect={() => handleConnect("youtube")}
            onDisconnect={() => handleDisconnect("youtube")}
            isConnected={connections.youtube.isConnected}
            data={youtubeData}
          />
        </TabsContent>

        <TabsContent value="instagram" className="pt-4">
          <InstagramConnect
            onConnect={() => handleConnect("instagram")}
            onDisconnect={() => handleDisconnect("instagram")}
            isConnected={connections.instagram.isConnected}
            data={instagramData}
          />
        </TabsContent>

        <TabsContent value="linkedin" className="pt-4">
          <LinkedInConnect
            onConnect={() => handleConnect("linkedin")}
            onDisconnect={() => handleDisconnect("linkedin")}
            isConnected={connections.linkedin.isConnected}
            data={linkedinData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}