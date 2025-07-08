"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  FileText, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Search,
  Filter,
  CalendarDays,
  Pencil,
  Trash2,
  Copy,
  RefreshCw,
  Terminal,
  Sparkles,
  Code,
  BrainCircuit,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";interface ContentHistoryProps {
  onEditContent: (content: any) => void;
}

type ContentItem = {
  id: string;
  type: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  status: string;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
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

export function ContentHistory({ onEditContent }: ContentHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();
  
  // Start the glow animation when component mounts
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

  useEffect(() => {
    fetchContentItems();
  }, []);

  const fetchContentItems = async () => {
    setIsLoading(true);
    try {
      // This is a simulated response for the demo
      // In a real application, you would make an API call
      // setTimeout(() => {
      //   setContentItems([
         
      //   ]);
      //   setIsLoading(false);
      // }, 1500);
      
      // Real API call would look like this:
      const response = await fetch("/api/dashboard/content-items");
      if (!response.ok) {
        throw new Error("Failed to fetch content items");
      }
      const data = await response.json();
      setContentItems(data.contentItems || []);
    } catch (error) {
      console.error("Error fetching content items:", error);
      toast.error("Failed to load content history", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // In a real implementation, you would make an API call
      const response = await fetch(`/api/dashboard/content-items/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      
      // Remove the deleted item from state
      setContentItems(contentItems.filter(item => item.id !== id));
      toast.success("Content deleted successfully!", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    }
  };

  const handleCopy = (item: ContentItem) => {
    const textToCopy = item.title ? `${item.title}\n\n${item.content}` : item.content;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Content copied to clipboard!", {
      style: {
        background: "#232323",
        color: "white",
        border: "1px solid #323232"
      }
    });
  };

  const getFilteredContent = () => {
    return contentItems
      .filter(item => {
        // Apply search filter
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.content.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Apply type filter
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        // Apply sorting
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "blog-post":
        return <FileText className="h-4 w-4 text-[#bcee45]" />;
      case "instagram":
        return <Instagram className="h-4 w-4 text-[#bcee45]" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4 text-[#bcee45]" />;
      case "twitter":
        return <Twitter className="h-4 w-4 text-[#bcee45]" />;
      default:
        return <FileText className="h-4 w-4 text-[#bcee45]" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "blog-post":
        return "Blog Post";
      case "instagram":
        return "Instagram";
      case "linkedin":
        return "LinkedIn";
      case "twitter":
        return "Twitter";
      default:
        return type;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "published":
        return "bg-[#bcee45]/20 text-[#bcee45]";
      case "draft":
        return "bg-[#666]/20 text-gray-400";
      case "scheduled":
        return "bg-[#22d3ee]/20 text-[#22d3ee]";
      default:
        return "bg-[#323232] text-gray-300";
    }
  };

  const filteredContent = getFilteredContent();

  return (
    <div className="w-full relative">
      {/* Animated glow spots */}
      <motion.div 
        ref={glowRef}
        animate={glowControls}
        className="absolute top-40 left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30 pointer-events-none"
      ></motion.div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search content..."
            className="pl-9 bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30 placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select 
            value={typeFilter} 
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-full sm:w-40 bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#323232] text-gray-300">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="blog-post">Blog Posts</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={sortOrder} 
            onValueChange={setSortOrder}
          >
            <SelectTrigger className="w-full sm:w-40 bg-[#232323] border-[#323232] text-gray-300 focus:ring-offset-0 focus:ring-0 focus:ring-offset-transparent focus:border-[#bcee45]/30">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#323232] text-gray-300">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchContentItems}
            className="h-10 w-10 border-[#323232] text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array(3).fill(0).map((_, index) => (
            <Card key={`skeleton-${index}`} className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/50 to-[#161616]/50 backdrop-blur-sm hover:shadow-lg hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative">
              <CardContent className="p-0">
                <div className="h-48 bg-[#232323] animate-pulse"></div>
                <div className="p-4 space-y-2">
                  <div className="h-6 bg-[#232323] animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-[#232323] animate-pulse rounded w-1/2"></div>
                  <div className="h-4 bg-[#232323] animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-[#232323] animate-pulse rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredContent.length === 0 ? (
        <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative">
          <CardContent className="p-12 flex flex-col items-center justify-center">
            <div className="p-6 rounded-full bg-[#232323] mb-4">
              <Terminal className="h-8 w-8 text-[#bcee45]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">No content found</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {searchQuery || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Generate your first content to see it here"}
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                // Would redirect to content creation in real implementation
              }}
              className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                Create New Content
              </span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredContent.map((item) => (
            <motion.div 
              key={item.id}
              variants={itemVariants}
            >
              <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 transition-all rounded-xl overflow-hidden group relative h-full">
                {/* Glowing border effect on hover */}
                <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
                
                {/* Animated corner piece */}
                <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
                </div>
                
                <CardContent className="p-0 relative flex flex-col h-full">
                  {item.imageUrl ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-[#161616]/50 z-10"></div>
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1 border border-[#323232] z-20">
                        {getContentTypeIcon(item.type)}
                        <span className="text-gray-300">{getContentTypeLabel(item.type)}</span>
                      </div>
                      
                      <div className="absolute top-3 right-3 z-20">
                        <div className={`rounded-full px-2 py-1 text-xs ${getStatusBadgeStyles(item.status)}`}>
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-[#232323] to-[#1a1a1a] flex flex-col items-center justify-center">
                      <div className="p-3 rounded-full bg-[#323232]/80 mb-2">
                        {getContentTypeIcon(item.type)}
                      </div>
                      <div className="text-sm text-gray-400">{getContentTypeLabel(item.type)}</div>
                      
                      <div className="absolute top-3 left-3">
                        <div className={`rounded-full px-2 py-1 text-xs ${getStatusBadgeStyles(item.status)}`}>
                          {item.status}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-white group-hover:text-[#bcee45] transition-colors line-clamp-1 mb-1">{item.title}</h3>
                    <div className="flex items-center text-gray-500 text-xs mb-2">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">{item.content}</p>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <Button
                        variant="outline" 
                        size="sm"
                        className="text-xs border-[#323232] bg-[#232323]/50 text-gray-300 hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                        onClick={() => onEditContent(item)}
                      >
                        View & Edit
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-400 hover:text-[#bcee45] hover:bg-[#232323]"
                          >
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#323232] text-gray-300">
                          <DropdownMenuItem 
                            onClick={() => onEditContent(item)} 
                            className="cursor-pointer hover:bg-[#232323] hover:text-[#bcee45] focus:bg-[#232323] focus:text-[#bcee45]"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCopy(item)} 
                            className="cursor-pointer hover:bg-[#232323] hover:text-[#bcee45] focus:bg-[#232323] focus:text-[#bcee45]"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            <span>Copy</span>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="cursor-pointer text-[#ff5555] hover:bg-[#232323] hover:text-[#ff5555] focus:bg-[#232323] focus:text-[#ff5555]"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1a1a1a] border-[#323232] text-gray-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  This action cannot be undone. This will permanently delete this content
                                  from your account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item.id)}
                                  className="bg-[#ff5555] hover:bg-[#ff3333] text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}