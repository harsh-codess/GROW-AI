"use client";

import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Linkedin, Users, BarChart2, ExternalLink } from "lucide-react";

interface SocialOverviewProps {
  platform: "youtube" | "instagram" | "linkedin";
  data: any;
  isConnected: boolean;
  onSwitchTab: () => void;
}

export default function SocialOverview({
  platform,
  data,
  isConnected,
  onSwitchTab,
}: SocialOverviewProps) {
  // Format number for display
  const formatNumber = (num: number) => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(num);
  };

  // Get platform icon
  const getPlatformIcon = () => {
    switch (platform) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500 mr-2" />;
      case "instagram":
        return <Instagram className="h-4 w-4 text-pink-500 mr-2" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4 text-blue-500 mr-2" />;
      default:
        return null;
    }
  };

  // Get platform color
  const getPlatformColor = () => {
    switch (platform) {
      case "youtube":
        return "bg-red-500/10 text-red-500 border-red-200";
      case "instagram":
        return "bg-pink-500/10 text-pink-500 border-pink-200";
      case "linkedin":
        return "bg-blue-500/10 text-blue-500 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-200";
    }
  };

  // Get platform stats
  const getPlatformStats = () => {
    if (!data) return null;

    switch (platform) {
      case "youtube":
        return {
          followers: data.channel?.statistics?.subscriberCount || 0,
          content: data.channel?.statistics?.videoCount || 0,
          views: data.channel?.statistics?.viewCount || 0,
          contentLabel: "Videos",
        };
      case "instagram":
        return {
          followers: data.profile?.followers_count || 0,
          content: data.profile?.media_count || 0,
          views: null,
          contentLabel: "Posts",
        };
      case "linkedin":
        return {
          followers: data.profile?.connections || 0,
          content: data.posts?.length || 0,
          views: null,
          contentLabel: "Posts",
        };
      default:
        return {
          followers: 0,
          content: 0,
          views: 0,
          contentLabel: "Content",
        };
    }
  };

  // Get platform username
  const getPlatformUsername = () => {
    if (!data) return null;

    switch (platform) {
      case "youtube":
        return data.channel?.customUrl || data.channel?.title;
      case "instagram":
        return data.profile?.username ? `@${data.profile.username}` : null;
      case "linkedin":
        return data.profile?.name || null;
      default:
        return null;
    }
  };

  const stats = getPlatformStats();
  const username = getPlatformUsername();
  const platformColor = getPlatformColor();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${platformColor}`}>
          {getPlatformIcon()}
        </div>
        <p className="text-muted-foreground text-center">
          Not connected
        </p>
        <Button onClick={onSwitchTab}>Connect {platform}</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${platformColor}`}>
          {getPlatformIcon()}
        </div>
        <p className="text-muted-foreground text-center">
          Loading data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getPlatformIcon()}
          <span className="font-medium">{username}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onSwitchTab}>
          View Details
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <Users className="h-4 w-4 mx-auto mb-1 text-gray-500" />
          <p className="text-xs text-muted-foreground">
            {platform === "linkedin" ? "Connections" : "Followers"}
          </p>
          <p className="font-medium">{formatNumber(stats?.followers || 0)}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <BarChart2 className="h-4 w-4 mx-auto mb-1 text-gray-500" />
          <p className="text-xs text-muted-foreground">{stats?.contentLabel}</p>
          <p className="font-medium">{formatNumber(stats?.content || 0)}</p>
        </div>
        {stats?.views !== null && (
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <Users className="h-4 w-4 mx-auto mb-1 text-gray-500" />
            <p className="text-xs text-muted-foreground">Views</p>
            <p className="font-medium">{formatNumber(stats?.views || 0)}</p>
          </div>
        )}
      </div>

      {/* Platform specific recent activity */}
      {platform === "youtube" && data.videos && data.videos.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Latest Video</p>
          <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-md">
            <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-md">
              <img
                src={data.videos[0]?.thumbnail?.url || "/api/placeholder/100/56"}
                alt={data.videos[0]?.title || "Latest video"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{data.videos[0]?.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data.videos[0]?.statistics?.viewCount || 0)} views
              </p>
            </div>
          </div>
        </div>
      )}

      {platform === "instagram" && data.media && data.media.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Latest Post</p>
          <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-md">
            <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-md">
              <img
                src={data.media[0]?.media_url || "/api/placeholder/100/100"}
                alt={data.media[0]?.caption || "Latest post"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">
                {data.media[0]?.caption?.substring(0, 50) || "Instagram post"}
                {data.media[0]?.caption?.length > 50 ? "..." : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data.media[0]?.like_count || 0)} likes
              </p>
            </div>
          </div>
        </div>
      )}
      
      {platform === "linkedin" && data.posts && data.posts.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Latest Post</p>
          <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-md">
            <div className="w-14 h-14 flex-shrink-0 bg-blue-50 rounded-md flex items-center justify-center">
              <Linkedin className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">
                {data.posts[0]?.text?.substring(0, 50) || "LinkedIn post"}
                {data.posts[0]?.text?.length > 50 ? "..." : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data.posts[0]?.likesSummary?.totalLikes || 0)} likes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}