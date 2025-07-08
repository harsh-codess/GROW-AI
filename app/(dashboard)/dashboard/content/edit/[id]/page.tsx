// app/(dashboard)/dashboard/content/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

export default function ContentEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contentItem, setContentItem] = useState<any>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    fetchContentItem();
  }, [params.id]);

  const fetchContentItem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard/content-items/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch content item");
      }
      const data = await response.json();
      
      setContentItem(data.contentItem);
      setEditedTitle(data.contentItem.title);
      setEditedContent(data.contentItem.content);
      setStatus(data.contentItem.status);
    } catch (error) {
      console.error("Error fetching content item:", error);
      toast.error("Failed to load content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/dashboard/content-items/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
          status,
        }),

      });

      if (!response.ok) {
        throw new Error("Failed to update content");
      }

      toast.success("Content updated successfully!");
      router.push("/dashboard/content");
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Failed to update content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/dashboard/content-items/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete content");
      }

      toast.success("Content deleted successfully!");
      router.push("/dashboard/content");
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Content</h1>
            <p className="text-muted-foreground">
              Loading content...
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="h-[500px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contentItem) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Not Found</h1>
            <p className="text-muted-foreground">
              The requested content could not be found.
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/content")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500">Content not found or you don't have permission to view it.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "blog-post":
        return "Blog Post";
      case "instagram":
        return "Instagram Post";
      case "linkedin":
        return "LinkedIn Post";
      case "twitter":
        return "Twitter Post";
      case "facebook":
        return "Facebook Post";
      case "email":
        return "Email Campaign";
      case "product-description":
        return "Product Description";
      case "ad-copy":
        return "Ad Copy";
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Content</h1>
          <p className="text-muted-foreground">
            Update your {getContentTypeLabel(contentItem.type)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/content")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this content
                  from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-md px-3 py-2 text-sm">
              <span className="font-medium">Content Type:</span>
              <span>{getContentTypeLabel(contentItem.type)}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="transition-all focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[300px] transition-all focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger id="status" className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contentItem.imageUrl && (
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="rounded-md overflow-hidden border border-gray-200 max-w-md">
                  <img
                    src={contentItem.imageUrl}
                    alt={contentItem.title}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}