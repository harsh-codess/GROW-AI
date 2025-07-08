"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Youtube, 
  Loader2, 
  RefreshCcw, 
  Calendar, 
  ArrowRight 
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

interface YouTubeConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
  data?: any;
}

export default function YouTubeConnect({
  onConnect,
  onDisconnect,
  isConnected = false,
  data = null,
}: YouTubeConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [youtubeData, setYoutubeData] = useState<any>(data);

  // Update data if prop changes
  useEffect(() => {
    if (data) {
      setYoutubeData(data);
    }
  }, [data]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the YouTube auth URL
      const response = await axios.get('/api/social/youtube/auth');
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
        // Use popup for desktop
        const width = 600;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          authUrl,
          "YouTube Auth",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          console.warn("Popup was blocked. Trying direct navigation...");
          // Fallback: Open in same window
          const currentUrl = encodeURIComponent(window.location.href);
          const finalAuthUrl = authUrl.includes("?") 
            ? `${authUrl}&state=${currentUrl}` 
            : `${authUrl}?state=${currentUrl}`;
          
          window.location.href = finalAuthUrl;
          return;
        }

        // Setup message listener for callback from popup
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "YOUTUBE_AUTH_CALLBACK") {
            window.removeEventListener("message", messageHandler);
            
            if (event.data.error) {
              setError(`Authentication failed: ${event.data.error}`);
              setLoading(false);
            } else if (event.data.code) {
              handleAuthCode(event.data.code);
            }
          }
        };

        window.addEventListener("message", messageHandler);

        // Also check if popup closes without sending a message
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            window.removeEventListener("message", messageHandler);
            setLoading(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setError(error.message || "Failed to initiate YouTube connection");
      setLoading(false);
    }
  };

  // Handle auth code from callback
  const handleAuthCode = async (code: string) => {
    try {
      // Exchange code for token and get user profile
      const response = await axios.post('/api/social/youtube/auth', { code });
      
      // Fetch YouTube data
      await fetchYoutubeData(true);
      
      // Call onConnect callback if provided
      if (onConnect) {
        onConnect();
      }

      toast.success("YouTube account connected successfully!");
    } catch (error) {
      console.error("YouTube auth error:", error);
      setError(error.response?.data?.message || "Failed to connect YouTube");
    } finally {
      setLoading(false);
    }
  };

  // Check URL for auth code when component mounts (for mobile flow)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const authError = searchParams.get("error");
    const isYoutubeAuth = searchParams.get("youtube_auth") === "true";
    
    if (isYoutubeAuth && (code || authError)) {
      if (code) {
        setLoading(true);
        handleAuthCode(code);
      } else if (authError) {
        setError(`Authentication failed: ${authError}`);
      }
      
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
        data: { platform: 'youtube' }
      });

      // Clear YouTube data
      setYoutubeData(null);

      // Call onDisconnect callback if provided
      if (onDisconnect) {
        onDisconnect();
      }

      toast.success("YouTube account disconnected successfully");
    } catch (error) {
      console.error("Disconnect error:", error);
      setError(error.message || "Failed to disconnect YouTube");
    } finally {
      setLoading(false);
      setShowDisconnectDialog(false);
    }
  };

  const fetchYoutubeData = async (forceRefresh = false) => {
    try {
      setIsLoadingData(true);
      const response = await axios.get(`/api/social/youtube/data?force=${forceRefresh}`);
      setYoutubeData(response.data.data);
    } catch (error) {
      console.error("Error fetching YouTube data:", error);
      toast.error("Failed to fetch YouTube data");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Format number for display
  const formatNumber = (num: number) => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(num);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  // Get latest videos
  const latestVideos = youtubeData?.videos?.slice(0, 3) || [];

  return (
    <>
      <div className="p-6 bg-card/60 backdrop-blur-md rounded-2xl border border-border overflow-hidden">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/20">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-1">YouTube</h3>
              <p className="text-sm text-muted-foreground">
                {isLoadingData ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking connection...
                  </span>
                ) : isConnected ? (
                  youtubeData?.channel?.customUrl ? (
                    <span className="font-medium">
                      {youtubeData.channel.customUrl}
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

          {isConnected && youtubeData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Stats Section */}
              <div className="grid grid-cols-3 gap-4 pt-4 pb-4 border-t border-border">
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">
                    Subscribers
                  </p>
                  <p className="text-foreground font-medium">
                    {formatNumber(
                      youtubeData?.channel?.statistics?.subscriberCount || 0
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">Videos</p>
                  <p className="text-foreground font-medium">
                    {formatNumber(
                      youtubeData?.channel?.statistics?.videoCount || 0
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">
                    Total Views
                  </p>
                  <p className="text-foreground font-medium">
                    {formatNumber(
                      youtubeData?.channel?.statistics?.viewCount || 0
                    )}
                  </p>
                </div>
              </div>

              {/* Recent Videos Section */}
              {latestVideos.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium mb-3">Recent Videos</h4>
                  <div className="space-y-3">
                    {latestVideos.map((video: any) => (
                      <div
                        key={video.id}
                        className="bg-background/50 rounded-lg p-3 border border-border/50 hover:border-border transition-all"
                      >
                        <div className="flex gap-3">
                          {/* Video thumbnail */}
                          <div
                            className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 cursor-pointer"
                            onClick={() =>
                              window.open(
                                `https://www.youtube.com/watch?v=${video.id}`,
                                "_blank"
                              )
                            }
                          >
                            <div className="relative w-full h-full">
                              <img
                                src={
                                  video.thumbnail?.url ||
                                  "/api/placeholder/320/180"
                                }
                                alt={video.title || "YouTube video"}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-6 h-6 text-white opacity-80"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Video details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(video.publishedAt)}
                            </p>
                            <p className="text-sm line-clamp-2">
                              {truncateText(video.title)}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatNumber(video.statistics?.viewCount || 0)}{" "}
                                views
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatNumber(video.statistics?.likeCount || 0)}{" "}
                                likes
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {youtubeData?.videos?.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm">
                        View More Videos
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* No videos state */}
              {(!youtubeData.videos || youtubeData.videos.length === 0) && (
                <div className="pt-2 pb-2 text-center border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    No videos found for this YouTube channel.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {isLoadingData && !youtubeData && (
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
                Connect your YouTube account to display your latest videos and
                stats in your dashboard.
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
              Disconnect YouTube Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your YouTube account connection. Your dashboard
              won't display YouTube stats anymore. You can always reconnect
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