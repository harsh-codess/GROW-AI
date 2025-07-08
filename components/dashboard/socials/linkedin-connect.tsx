"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Linkedin, 
  Loader2, 
  RefreshCcw, 
  Calendar, 
  MessageCircle,
  ThumbsUp,
  ArrowRight,
  User,
  Briefcase
} from "lucide-react";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LinkedInConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
  data?: any;
}

export default function LinkedInConnect({
  onConnect,
  onDisconnect,
  isConnected = false,
  data = null,
}: LinkedInConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [linkedinData, setLinkedinData] = useState<any>(data);

  // Update data if prop changes
  useEffect(() => {
    if (data) {
      setLinkedinData(data);
    }
  }, [data]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the LinkedIn auth URL
      const response = await axios.get('/api/social/linkedin/auth');
      const authUrl = response.data.url;

      if (!authUrl) {
        throw new Error("Failed to get authorization URL");
      }

      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Direct navigation for mobile devices
        // Encode the current URL as the state parameter for return navigation
        const currentUrl = encodeURIComponent(window.location.href);
        const finalAuthUrl = authUrl.includes("?") 
          ? `${authUrl}&state=${currentUrl}` 
          : `${authUrl}?state=${currentUrl}`;
        
        window.location.href = finalAuthUrl;
      } else {
        // Redirect to the LinkedIn auth page
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error("Connection error:", error);
      setError(error.message || "Failed to initiate LinkedIn connection");
      setLoading(false);
    }
  };

  // Handle auth code from callback
  const handleAuthCode = async (code: string, state: string) => {
    try {
      // Exchange code for token and get user profile
      const response = await axios.post('/api/social/linkedin/auth', { code, state });
      
      // Fetch LinkedIn data
      await fetchLinkedInData(true);
      
      // Call onConnect callback if provided
      if (onConnect) {
        onConnect();
      }

      toast.success("LinkedIn account connected successfully!");
    } catch (error) {
      console.error("LinkedIn auth error:", error);
      setError(error.response?.data?.message || "Failed to connect LinkedIn");
    } finally {
      setLoading(false);
    }
  };

  // Check URL for auth code when component mounts
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("linkedinState");
    const error = searchParams.get("error");
    const isLinkedInAuth = searchParams.get("linkedin_auth") === "true";
    
    if (isLinkedInAuth && code && state) {
      setLoading(true);
      handleAuthCode(code, state);
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (isLinkedInAuth && error) {
      setError(`Authentication failed: ${error}`);
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete('/api/social/connections', {
        data: { platform: 'linkedin' }
      });

      // Clear LinkedIn data
      setLinkedinData(null);

      // Call onDisconnect callback if provided
      if (onDisconnect) {
        onDisconnect();
      }

      toast.success("LinkedIn account disconnected successfully");
    } catch (error) {
      console.error("Disconnect error:", error);
      setError(error.message || "Failed to disconnect LinkedIn");
    } finally {
      setLoading(false);
      setShowDisconnectDialog(false);
    }
  };

  const fetchLinkedInData = async (forceRefresh = false) => {
    try {
      setIsLoadingData(true);
      const response = await axios.get(`/api/social/linkedin/data?force=${forceRefresh}`);
      setLinkedinData(response.data.data);
    } catch (error) {
      console.error("Error fetching LinkedIn data:", error);
      toast.error("Failed to fetch LinkedIn data");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Format number for display
  const formatNumber = (num: number) => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(num);
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Truncate text
  const truncateText = (text: string, maxLength = 80) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Get latest posts
  const latestPosts = linkedinData?.posts?.slice(0, 3) || [];

  return (
    <>
      <div className="p-6 bg-card/60 backdrop-blur-md rounded-2xl border border-border overflow-hidden">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/20">
              <Linkedin className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-1">LinkedIn</h3>
              <p className="text-sm text-muted-foreground">
                {isLoadingData ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking connection...
                  </span>
                ) : isConnected ? (
                  linkedinData?.profile?.name ? (
                    <span className="font-medium">
                      {linkedinData.profile.name}
                    </span>
                  ) : (
                    "Connected"
                  )
                ) : (
                  "Not Connected"
                )}
              </p>
            </div>
          </div>

          <Button
            onClick={
              isConnected ? () => setShowDisconnectDialog(true) : handleConnect
            }
            variant={isConnected ? "outline" : "default"}
            className={`${
              isConnected
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-primary text-primary-foreground"
            } ${
              loading || isLoadingData
                ? "cursor-not-allowed"
                : ""
            }`}
            disabled={loading || isLoadingData}
          >
            {loading || isLoadingData ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500 flex items-center justify-between"
            >
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => setError(null)}
              >
                <RefreshCcw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </motion.div>
          )}

          {isConnected && linkedinData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Profile Section */}
              <div className="grid grid-cols-3 gap-4 pt-4 pb-4 border-t border-border">
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">
                    Connections
                  </p>
                  <p className="text-foreground font-medium">
                    {formatNumber(linkedinData?.profile?.connections || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">Posts</p>
                  <p className="text-foreground font-medium">
                    {formatNumber(linkedinData?.posts?.length || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">
                    Industry
                  </p>
                  <p className="text-foreground font-medium truncate">
                    {linkedinData?.profile?.industry || "N/A"}
                  </p>
                </div>
              </div>

              {/* Profile Info */}
              {linkedinData?.profile && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                      {linkedinData.profile.profilePicture ? (
                        <img 
                          src={linkedinData.profile.profilePicture}
                          alt={linkedinData.profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-400 m-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{linkedinData.profile.name}</p>
                      {linkedinData.profile.headline && (
                        <p className="text-sm text-muted-foreground">
                          {linkedinData.profile.headline}
                        </p>
                      )}
                      {linkedinData.profile.location && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {linkedinData.profile.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Posts Section */}
              {latestPosts.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium mb-3">Recent Posts</h4>
                  <div className="space-y-3">
                    {latestPosts.map((post: any) => (
                      <div
                        key={post.id}
                        className="bg-background/50 rounded-lg p-3 border border-border/50 hover:border-border transition-all"
                      >
                        <div className="flex gap-3">
                          {/* Post text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(post.created)}
                            </p>
                            <p className="text-sm line-clamp-2">
                              {truncateText(post.text)}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {formatNumber(post.likesSummary?.totalLikes || 0)}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                {formatNumber(post.commentsSummary?.totalComments || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {linkedinData?.posts?.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm">
                        View More Posts
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* No posts state */}
              {(!linkedinData.posts || linkedinData.posts.length === 0) && (
                <div className="pt-2 pb-2 text-center border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    No posts found for this LinkedIn account.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {isLoadingData && !linkedinData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center pt-4 pb-2"
            >
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </motion.div>
          )}

          {!isConnected && !isLoadingData && (
            <div className="pt-4 pb-2 text-center border-t border-border">
              <p className="text-sm text-muted-foreground">
                Connect your LinkedIn account to display your latest posts and
                professional network stats in your dashboard.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">
              Disconnect LinkedIn Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your LinkedIn account connection. Your dashboard
              won't display LinkedIn stats anymore. You can always reconnect
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-red-500/20 text-red-500 hover:border-red-500/40">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}