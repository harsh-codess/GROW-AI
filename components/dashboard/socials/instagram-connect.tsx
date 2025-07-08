"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Instagram, 
  Loader2, 
  RefreshCcw, 
  Calendar, 
  Heart,
  MessageCircle,
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

interface InstagramConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
  data?: any;
}

export default function InstagramConnect({
  onConnect,
  onDisconnect,
  isConnected = false,
  data = null,
}: InstagramConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [instagramData, setInstagramData] = useState<any>(data);
  const [usingDirectNav, setUsingDirectNav] = useState(false);

  // Check for mobile browser
  const isMobile = useRef(
    typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
  );

  // Check for iOS Safari
  const isIOSSafari = useRef(
    typeof window !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !/CriOS|FxiOS/.test(navigator.userAgent) &&
      (window as any).webkit
  );

  // Update data if prop changes
  useEffect(() => {
    if (data) {
      setInstagramData(data);
    }
  }, [data]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the Instagram auth URL
      const response = await axios.get('/api/social/instagram/auth');
      const authUrl = response.data.url;

      if (!authUrl) {
        throw new Error("Failed to get authorization URL");
      }

      console.log("[INSTA CONNECT] Handling authentication flow");
      setUsingDirectNav(true);

      // Get the current page's URL (where Instagram component is mounted)
      const currentAppComponentUrl = window.location.href.split("?")[0];

      if (isIOSSafari.current) {
        console.log("[INSTA CONNECT] Handling iOS Safari flow");
        
        // iOS Safari specific handling
        const timestamp = Date.now().toString();
        sessionStorage.setItem("instagram_auth_timestamp", timestamp);
        sessionStorage.setItem("instagram_return_url", currentAppComponentUrl);

        try {
          // Add iOS Safari specific state to the URL
          const url = new URL(authUrl);
          url.searchParams.set("state", `ios_safari_${timestamp}`);
          
          // Navigate directly to the auth URL
          window.location.href = url.toString();
        } catch (e) {
          console.error("[INSTA CONNECT] Error parsing Instagram auth URL:", e);
          
          // Fallback method for iOS Safari
          const stateParam = `state=ios_safari_${timestamp}`;
          const finalAuthUrl = authUrl.includes("?")
            ? `${authUrl}&${stateParam}`
            : `${authUrl}?${stateParam}`;
          
          window.location.href = finalAuthUrl;
        }
      } else {
        // Standard flow for other browsers
        console.log("[INSTA CONNECT] Handling standard browser flow");
        
        // Encode the return URL in the state parameter
        const encodedReturnUrl = encodeURIComponent(currentAppComponentUrl);
        
        try {
          const url = new URL(authUrl);
          url.searchParams.set("state", encodedReturnUrl);
          url.searchParams.append("instagram_auth", "true");
          
          window.location.href = url.toString();
        } catch (e) {
          console.error("[INSTA CONNECT] Error parsing Instagram auth URL:", e);
          
          // Fallback method
          const stateParam = `state=${encodedReturnUrl}`;
          const instagramAuthParam = "instagram_auth=true";
          const separator = authUrl.includes("?") ? "&" : "?";
          const finalAuthUrl = `${authUrl}${separator}${stateParam}&${instagramAuthParam}`;
          
          window.location.href = finalAuthUrl;
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      setError(error.message || "Failed to initiate Instagram connection");
      setLoading(false);
      setUsingDirectNav(false);
    }
  };

  // Handle auth code from callback
  const handleAuthCode = async (code: string) => {
    try {
      // Exchange code for token and get user profile
      const response = await axios.post('/api/social/instagram/auth', { code });

      // Fetch Instagram data
      await fetchInstagramData(true);
      
      // Call onConnect callback if provided
      if (onConnect) {
        onConnect();
      }

      toast.success("Instagram account connected successfully!");
    } catch (error) {
      console.error("Instagram auth error:", error);
      setError(error.response?.data?.message || "Failed to connect Instagram");
    } finally {
      setLoading(false);
      setUsingDirectNav(false);
    }
  };

  // Check URL for auth code when component mounts (for direct navigation flow)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const authError = searchParams.get("error");
    const isInstagramAuth = searchParams.get("instagram_auth") === "true";
    
    if (isInstagramAuth && (code || authError)) {
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
        data: { platform: 'instagram' }
      });

      // Clear Instagram data
      setInstagramData(null);

      // Call onDisconnect callback if provided
      if (onDisconnect) {
        onDisconnect();
      }

      toast.success("Instagram account disconnected successfully");
    } catch (error) {
      console.error("Disconnect error:", error);
      setError(error.message || "Failed to disconnect Instagram");
    } finally {
      setLoading(false);
      setShowDisconnectDialog(false);
    }
  };

  const fetchInstagramData = async (forceRefresh = false) => {
    try {
      setIsLoadingData(true);
      const response = await axios.get(`/api/social/instagram/data?force=${forceRefresh}`);
      setInstagramData(response.data.data);
    } catch (error) {
      console.error("Error fetching Instagram data:", error);
      toast.error("Failed to fetch Instagram data");
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

  // Truncate caption
  const truncateCaption = (caption: string, maxLength = 80) => {
    if (!caption) return "";
    return caption.length > maxLength
      ? caption.substring(0, maxLength) + "..."
      : caption;
  };

  // Get latest 3 posts if available
  const latestPosts = instagramData?.media?.slice(0, 3) || [];

  // Show a special loading state when using direct navigation
  if (usingDirectNav) {
    return (
      <div className="p-6 bg-card/60 backdrop-blur-md rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-center flex-col py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <h3 className="text-foreground font-medium mb-2">
            Connecting to Instagram
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Please complete the authentication in the Instagram window.
            <br />
            You'll be redirected back automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-card/60 backdrop-blur-md rounded-2xl border border-border overflow-hidden">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-500/20">
              <Instagram className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-1">Instagram</h3>
              <p className="text-sm text-muted-foreground">
                {isLoadingData ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking connection...
                  </span>
                ) : isConnected ? (
                  instagramData?.profile?.username ? (
                    <span className="flex items-center">
                      <span className="font-medium">
                        @{instagramData.profile.username}
                      </span>
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

          {isConnected && instagramData && (
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
                    Followers
                  </p>
                  <p className="text-foreground font-medium">
                    {formatNumber(instagramData.profile?.followers_count || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">Media</p>
                  <p className="text-foreground font-medium">
                    {formatNumber(instagramData.profile?.media_count || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">
                    Account Type
                  </p>
                  <p className="text-foreground font-medium">
                    {instagramData.profile?.account_type == "MEDIA_CREATOR"
                      ? "CREATOR"
                      : instagramData.profile?.account_type || "Business"}
                  </p>
                </div>
              </div>

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
                          {/* Post thumbnail */}
                          <div
                            className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 cursor-pointer"
                            onClick={() =>
                              window.open(post.permalink, "_blank")
                            }
                          >
                            {post.media_type === "VIDEO" ? (
                              <div className="w-full h-full flex items-center justify-center bg-black/20">
                                <img
                                  src={post.thumbnail_url || post.media_url || "/api/placeholder/150/150"}
                                  alt={post.caption || "Instagram post"}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                    />
                                  </svg>
                                </div>
                              </div>
                            ) : post.media_type === "CAROUSEL_ALBUM" ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={post.media_url || "/api/placeholder/150/150"}
                                  alt={post.caption || "Instagram post"}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1 right-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-white"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={post.media_url || "/api/placeholder/150/150"}
                                alt={post.caption || "Instagram post"}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Post details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(post.timestamp)}
                            </p>
                            <p className="text-sm line-clamp-2">
                              {truncateCaption(post.caption)}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {post.like_count !== undefined && (
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Heart className="w-3 h-3 mr-1" />
                                  {formatNumber(post.like_count)}
                                </span>
                              )}
                              {post.comments_count !== undefined && (
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  {formatNumber(post.comments_count)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {instagramData?.media?.length > 3 && (
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
              {(!instagramData.media || instagramData.media.length === 0) && (
                <div className="pt-2 pb-2 text-center border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    No posts found for this Instagram account.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {isLoadingData && !instagramData && (
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
                Connect your Instagram account to display your latest posts and
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
              Disconnect Instagram Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your Instagram account connection. Your dashboard
              won't display Instagram stats anymore. You can always reconnect
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