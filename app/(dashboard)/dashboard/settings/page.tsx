// app/(dashboard)/dashboard/settings/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  User, 
  Building2, 
  Palette, 
  Lock, 
  Bell, 
  CreditCard, 
  Users, 
  Globe, 
  Upload, 
  Check, 
  Loader2,
  Moon,
  Save,
  Key,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Terminal,
  Shield,
  Database,
  Settings,
  Code
} from "lucide-react";

// Types for our settings data
interface UserProfileSettings {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string;
}

interface CompanySettings {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  logo: string | null;
  primaryColor: string | null;
  missionStatement: string | null;
  targetAudience: string | null;
}

interface NotificationSettings {
  emailNotifications: boolean;
  marketingEmails: boolean;
  activityDigest: boolean;
  newFeatures: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginHistory: Array<{
    date: string;
    device: string;
    location: string;
    ip: string;
  }>;
}


interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  status: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for different setting sections
  const [userProfile, setUserProfile] = useState<UserProfileSettings | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    marketingEmails: false,
    activityDigest: true,
    newFeatures: true,
  });
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginHistory: [],
  });
  const [team, setTeam] = useState<TeamMember[]>([]);
  
  // For password change
  const [newPassword, setNewPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  
  // For team member invitation
  const [newTeamMember, setNewTeamMember] = useState({
    email: "",
    role: "Viewer",
  });

  // Password visibility toggle
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // File inputs for avatar and logo
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();
  
  const router = useRouter();

  // Animate glow effect
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

  // Fetch all required data when the component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch in parallel for better performance
        await Promise.all([
          fetchUserProfile(),
          fetchCompanyData(),
        //   fetchSecurityData(),
          fetchNotificationSettings(),
        ]);
      } catch (err) {
        console.error("Error fetching settings data:", err);
        setError("Failed to load settings. Please try again.");
        toast.error("Failed to load settings", {
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
    
    fetchAllData();
  }, []);

  // Individual fetch functions
  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      
      const data = await response.json();
      setUserProfile(data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };
  
  const fetchCompanyData = async () => {
    try {
      const response = await fetch("/api/company/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }
      
      const data = await response.json();
      setCompany(data.company);
    } catch (error) {
      console.error("Error fetching company data:", error);
      throw error;
    }
  };
    
  const fetchSecurityData = async () => {
    try {
      const response = await fetch("/api/user/security");
      
      if (!response.ok) {
        throw new Error("Failed to fetch security data");
      }
      
      const data = await response.json();
      setSecurity({
        twoFactorEnabled: data.twoFactorEnabled || false,
        loginHistory: data.loginHistory || [],
      });
    } catch (error) {
      console.error("Error fetching security data:", error);
      // Don't throw here, just use default values
    }
  };

  
  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch("/api/user/notifications");
      
      if (!response.ok) {
        throw new Error("Failed to fetch notification settings");
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      // Don't throw here, just use default values
    }
  };

  // Handler functions for each section
  const handleUserProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!userProfile) return;
    
    const { name, value } = e.target;
    setUserProfile((prev) => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!company) return;
    
    const { name, value } = e.target;
    setCompany((prev) => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPassword((prev) => ({ ...prev, [name]: value }));
  };
  

  
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle file uploads
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      
      // Create a preview if needed
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            avatar: reader.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      
      // Create a preview if needed
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (company) {
          setCompany({
            ...company,
            logo: reader.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save handlers for each section
  const saveUserProfile = async () => {
    if (!userProfile) return;
    
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('name', userProfile.name);
      formData.append('bio', userProfile.bio);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      toast.success("Profile updated successfully", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const saveCompanySettings = async () => {
    if (!company) return;
    
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('name', company.name);
      formData.append('website', company.website || '');
      formData.append('industry', company.industry || '');
      formData.append('size', company.size || '');
      formData.append('primaryColor', company.primaryColor || '');
      formData.append('missionStatement', company.missionStatement || '');
      formData.append('targetAudience', company.targetAudience || '');
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      const response = await fetch("/api/company/profile", {
        method: "PUT",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update company settings");
      }
      
      toast.success("Company settings updated successfully", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } catch (error) {
      console.error("Error updating company settings:", error);
      toast.error("Failed to update company settings", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const saveNotificationSettings = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notifications),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update notification preferences");
      }
      
      toast.success("Notification preferences updated", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error("Failed to update notification preferences", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleTwoFactor = async (enabled: boolean) => {
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/user/security/two-factor", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update two-factor authentication");
      }
      
      setSecurity(prev => ({
        ...prev,
        twoFactorEnabled: enabled,
      }));
      
      toast.success(enabled 
        ? "Two-factor authentication enabled" 
        : "Two-factor authentication disabled",
        {
          style: {
            background: "#232323",
            color: "white",
            border: "1px solid #323232"
          }
        }
      );
    } catch (error) {
      console.error("Error updating two-factor:", error);
      toast.error("Failed to update two-factor authentication", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const changePassword = async () => {
    setIsSaving(true);
    
    try {
      // Validate password
      if (newPassword.new !== newPassword.confirm) {
        toast.error("New passwords don't match", {
          style: {
            background: "#232323",
            color: "white",
            border: "1px solid #323232"
          }
        });
        return;
      }
      
      if (newPassword.new.length < 8) {
        toast.error("Password must be at least 8 characters long", {
          style: {
            background: "#232323",
            color: "white",
            border: "1px solid #323232"
          }
        });
        return;
      }
      
      const response = await fetch("/api/user/security/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: newPassword.current,
          newPassword: newPassword.new,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to change password");
      }
      
      // Reset form
      setNewPassword({
        current: "",
        new: "",
        confirm: "",
      });
      
      toast.success("Password changed successfully", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error((error as Error).message || "Failed to change password", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-6 text-gray-200 min-h-screen relative">
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
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="mr-3 h-8 w-8 rounded-md bg-[#bcee45] flex items-center justify-center">
            <Settings className="h-4 w-4 text-[#161616]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              System <span className="text-[#bcee45]">Settings</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Configure your account and preferences
            </p>
          </div>
        </div>
        
        {/* Show loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-[#bcee45]/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#bcee45] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 mt-4">Loading configuration data...</p>
            </div>
          </div>
        ) : error ? (
          // Show error state
          <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative">
            {/* Top illuminated border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
            
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="p-4 rounded-full bg-red-500/20 mb-4">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">Failed to load settings</h3>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                {error}
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-[#232323] border border-[#323232] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Main content
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="bg-[#232323] border border-[#323232] p-1 rounded-lg">
              <TabsTrigger 
                value="profile" 
                className={`flex items-center ${activeTab === 'profile' ? 'bg-[#bcee45] text-[#161616]' : ' text-[#bcee45] hover:text-gray-200 data-[state=active]:text-[#161616]'}`}
              >
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger 
                value="company" 
                className={`flex items-center ${activeTab === 'company' ? 'bg-[#bcee45] text-[#161616]' : ' text-[#bcee45] hover:text-gray-200 data-[state=active]:text-[#161616] '}`}
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Company</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className={`flex items-center ${activeTab === 'notifications' ? 'bg-[#bcee45] text-[#161616]' : ' text-[#bcee45] hover:text-gray-200 data-[state=active]:text-[#161616]'}`}
              >
                <Bell className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className={`flex items-center ${activeTab === 'security' ? 'bg-[#bcee45] text-[#161616]' : ' text-[#bcee45] hover:text-gray-200 data-[state=active]:text-[#161616]'}`}
              >
                <Lock className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Settings */}
            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative">
                  {/* Top illuminated border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                  
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <User className="h-4 w-4 mr-2 text-[#bcee45]" />
                      User Profile
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  {userProfile && (
                    <>
                      <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-32 w-32 border-2 border-[#323232]">
                              <AvatarImage src={userProfile.avatar || ""} alt={userProfile.name} />
                              <AvatarFallback className="text-4xl bg-[#232323] text-[#bcee45]">
                                {userProfile.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <label className="cursor-pointer">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                                asChild
                              >
                                <span>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Change Avatar
                                </span>
                              </Button>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                              />
                            </label>
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                                <Input
                                  id="name"
                                  name="name"
                                  value={userProfile.name}
                                  onChange={handleUserProfileChange}
                                  className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={userProfile.email}
                                  readOnly // Email cannot be changed
                                  className="bg-[#232323] border-[#323232] text-gray-500 focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                              <Textarea
                                id="bio"
                                name="bio"
                                value={userProfile.bio}
                                onChange={handleUserProfileChange}
                                rows={4}
                                className="resize-none bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                              />
                              <p className="text-xs text-gray-500">
                                Tell us about yourself. This will be displayed on your profile.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end border-t border-[#323232] p-6 bg-[#1a1a1a]">
                        <Button 
                          onClick={saveUserProfile} 
                          disabled={isSaving}
                          className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                          <span className="relative z-10 flex items-center">
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </span>
                        </Button>
                      </CardFooter>
                    </>
                  )}
                </Card>
              </motion.div>
            </TabsContent>
            
            {/* Company Settings */}
            <TabsContent value="company">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative">
                  {/* Top illuminated border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                  
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-[#bcee45]" />
                      Company Profile
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your company information and branding
                    </CardDescription>
                  </CardHeader>
                  {company && (
                    <>
                      <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="h-32 w-32 rounded-xl flex items-center justify-center border-2 border-[#323232] overflow-hidden bg-[#232323]">
                              {company.logo ? (
                                <img 
                                  src={company.logo} 
                                  alt={company.name} 
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Building2 className="h-16 w-16 text-[#bcee45]/50" />
                              )}</div>
                              <label className="cursor-pointer">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex items-center border-[#323232] bg-[#232323] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
                                  asChild
                                >
                                  <span>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                  </span>
                                </Button>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleLogoChange}
                                />
                              </label>
                            </div>
                            
                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="companyName" className="text-gray-300">Company Name</Label>
                                  <Input
                                    id="companyName"
                                    name="name"
                                    value={company.name}
                                    onChange={handleCompanyChange}
                                    className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="website" className="text-gray-300">Website</Label>
                                  <Input
                                    id="website"
                                    name="website"
                                    value={company.website || ""}
                                    onChange={handleCompanyChange}
                                    className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                                  <Select 
                                    value={company.industry || ""} 
                                    onValueChange={(value) => setCompany({ ...company, industry: value })}
                                  >
                                    <SelectTrigger 
                                      id="industry" 
                                      className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                                    >
                                      <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[#323232] text-white">
                                      <SelectItem value="saas" className="focus:bg-[#232323] focus:text-[#bcee45]">SaaS</SelectItem>
                                      <SelectItem value="ecommerce" className="focus:bg-[#232323] focus:text-[#bcee45]">E-commerce</SelectItem>
                                      <SelectItem value="fintech" className="focus:bg-[#232323] focus:text-[#bcee45]">Fintech</SelectItem>
                                      <SelectItem value="healthcare" className="focus:bg-[#232323] focus:text-[#bcee45]">Healthcare</SelectItem>
                                      <SelectItem value="education" className="focus:bg-[#232323] focus:text-[#bcee45]">Education</SelectItem>
                                      <SelectItem value="retail" className="focus:bg-[#232323] focus:text-[#bcee45]">Retail</SelectItem>
                                      <SelectItem value="food" className="focus:bg-[#232323] focus:text-[#bcee45]">Food & Beverage</SelectItem>
                                      <SelectItem value="travel" className="focus:bg-[#232323] focus:text-[#bcee45]">Travel & Hospitality</SelectItem>
                                      <SelectItem value="real-estate" className="focus:bg-[#232323] focus:text-[#bcee45]">Real Estate</SelectItem>
                                      <SelectItem value="other" className="focus:bg-[#232323] focus:text-[#bcee45]">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="company-size" className="text-gray-300">Company Size</Label>
                                  <Select 
                                    value={company.size || ""} 
                                    onValueChange={(value) => setCompany({ ...company, size: value })}
                                  >
                                    <SelectTrigger 
                                      id="company-size" 
                                      className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                                    >
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[#323232] text-white">
                                      <SelectItem value="1-10" className="focus:bg-[#232323] focus:text-[#bcee45]">1-10 employees</SelectItem>
                                      <SelectItem value="11-50" className="focus:bg-[#232323] focus:text-[#bcee45]">11-50 employees</SelectItem>
                                      <SelectItem value="51-200" className="focus:bg-[#232323] focus:text-[#bcee45]">51-200 employees</SelectItem>
                                      <SelectItem value="201-500" className="focus:bg-[#232323] focus:text-[#bcee45]">201-500 employees</SelectItem>
                                      <SelectItem value="500+" className="focus:bg-[#232323] focus:text-[#bcee45]">500+ employees</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="primary-color" className="text-sm font-medium flex items-center text-gray-300">
                                  <Palette className="h-4 w-4 mr-2 text-[#bcee45]" />
                                  Primary Brand Color
                                </Label>
                                <div className="flex gap-3">
                                  <div 
                                    className="w-12 h-10 rounded-md border border-[#323232] cursor-pointer flex items-center justify-center overflow-hidden"
                                    style={{ backgroundColor: company.primaryColor || "#bcee45" }}
                                  >
                                    <Input 
                                      id="primary-color" 
                                      type="color" 
                                      className="w-16 h-16 cursor-pointer opacity-0 absolute"
                                      value={company.primaryColor || "#bcee45"}
                                      onChange={(e) => setCompany({ ...company, primaryColor: e.target.value })}
                                    />
                                  </div>
                                  <Input 
                                    type="text" 
                                    value={company.primaryColor || "#bcee45"}
                                    onChange={(e) => setCompany({ ...company, primaryColor: e.target.value })}
                                    className="flex-1 bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                                  />
                                </div>
                                <p className="text-xs text-gray-500">This color will be used in your AI-generated visuals</p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="missionStatement" className="text-gray-300">Mission Statement</Label>
                                <Textarea
                                  id="missionStatement"
                                  name="missionStatement"
                                  value={company.missionStatement || ""}
                                  onChange={handleCompanyChange}
                                  rows={3}
                                  className="resize-none bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                                />
                                <p className="text-xs text-gray-500">
                                  This helps our AI understand your brand voice
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="targetAudience" className="text-gray-300">Target Audience</Label>
                                <Textarea
                                  id="targetAudience"
                                  name="targetAudience"
                                  value={company.targetAudience || ""}
                                  onChange={handleCompanyChange}
                                  rows={3}
                                  className="resize-none bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                                />
                                <p className="text-xs text-gray-500">
                                  AI will target content specifically for this audience
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-[#323232] p-6 bg-[#1a1a1a]">
                          <Button 
                            onClick={saveCompanySettings} 
                            disabled={isSaving}
                            className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                            <span className="relative z-10 flex items-center">
                              {isSaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save Changes
                                </>
                              )}
                            </span>
                          </Button>
                        </CardFooter>
                      </>
                    )}
                  </Card>
                </motion.div>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative">
                    {/* Top illuminated border */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                    
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Bell className="h-4 w-4 mr-2 text-[#bcee45]" />
                        Notifications
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Configure how you want to be notified
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#323232] pb-4">
                          <div>
                            <h4 className="font-medium text-white">Email Notifications</h4>
                            <p className="text-sm text-gray-400">Receive system notifications via email</p>
                          </div>
                          <Switch 
                            checked={notifications.emailNotifications}
                            onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                            className="data-[state=checked]:bg-[#bcee45] data-[state=checked]:border-[#bcee45]"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between border-b border-[#323232] pb-4">
                          <div>
                            <h4 className="font-medium text-white">Marketing Emails</h4>
                            <p className="text-sm text-gray-400">Receive marketing emails and newsletters</p>
                          </div>
                          <Switch 
                            checked={notifications.marketingEmails}
                            onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                            className="data-[state=checked]:bg-[#bcee45] data-[state=checked]:border-[#bcee45]"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between border-b border-[#323232] pb-4">
                          <div>
                            <h4 className="font-medium text-white">Activity Digest</h4>
                            <p className="text-sm text-gray-400">Weekly summary of your account activity</p>
                          </div>
                          <Switch 
                            checked={notifications.activityDigest}
                            onCheckedChange={(checked) => handleNotificationChange('activityDigest', checked)}
                            className="data-[state=checked]:bg-[#bcee45] data-[state=checked]:border-[#bcee45]"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">New Features</h4>
                            <p className="text-sm text-gray-400">Get notified when we launch new features</p>
                          </div>
                          <Switch 
                            checked={notifications.newFeatures}
                            onCheckedChange={(checked) => handleNotificationChange('newFeatures', checked)}
                            className="data-[state=checked]:bg-[#bcee45] data-[state=checked]:border-[#bcee45]"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t border-[#323232] p-6 bg-[#1a1a1a]">
                      <Button 
                        onClick={saveNotificationSettings} 
                        disabled={isSaving}
                        className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                        <span className="relative z-10 flex items-center">
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </span>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </TabsContent>
              
              {/* Security Settings */}
              <TabsContent value="security">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative">
                    {/* Top illuminated border */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
                    
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-[#bcee45]" />
                        Password
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Change your password to maintain security
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password" className="text-gray-300">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              name="current"
                              type={showPasswords.current ? "text" : "password"}
                              value={newPassword.current}
                              onChange={handlePasswordChange}
                              className="pr-10 bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('current')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                            >
                              {showPasswords.current ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-password" className="text-gray-300">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              name="new"
                              type={showPasswords.new ? "text" : "password"}
                              value={newPassword.new}
                              onChange={handlePasswordChange}
                              className="pr-10 bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                            >
                              {showPasswords.new ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password" className="text-gray-300">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              name="confirm"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={newPassword.confirm}
                              onChange={handlePasswordChange}
                              className="pr-10 bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                            >
                              {showPasswords.confirm ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 flex items-center">
                            <Database className="h-3 w-3 mr-1 text-[#bcee45]" />
                            Password must be at least 8 characters long
                          </p>
                        </div>
                      </div>
                      
                      {/* Cyberpunk detail element */}
                      <div className="mt-4 p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden">
                        {/* Diagonal slash line */}
                        <div className="absolute -right-2 top-0 w-1 h-16 bg-[#bcee45]/20 rotate-45 transform origin-top-right"></div>
                        
                        <div className="flex items-start gap-3">
                          <Code className="h-4 w-4 text-[#bcee45] mt-1" />
                          <p className="text-xs text-gray-400">
                            For maximum security, use a combination of uppercase letters, lowercase letters, numbers, and symbols. Do not reuse passwords across multiple platforms.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t border-[#323232] p-6 bg-[#1a1a1a]">
                      <Button 
                        onClick={changePassword} 
                        disabled={isSaving}
                        className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                        <span className="relative z-10 flex items-center">
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Key className="mr-2 h-4 w-4" />
                              Update Password
                            </>
                          )}
                        </span>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
        
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
        `}</style>
      </div>
    );
  }