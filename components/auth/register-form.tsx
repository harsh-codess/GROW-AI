// components/auth/register-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Zap, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.message || "An error occurred during registration");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully", {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
      router.push("/onboarding");
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      const result = await signIn("google", {
        callbackUrl: "/onboarding",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      setError("An error occurred during Google signup");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl shadow-black/20 relative">
        {/* Top illuminated border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
        
        {/* Animated corner piece */}
        <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
        </div>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 bg-[#232323] border-[#323232] focus:border-[#bcee45] focus:ring-[#bcee45]/20 text-white"
                  disabled={isLoading}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 bg-[#232323] border-[#323232] focus:border-[#bcee45] focus:ring-[#bcee45]/20 text-white"
                  disabled={isLoading}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 bg-[#232323] border-[#323232] focus:border-[#bcee45] focus:ring-[#bcee45]/20 text-white"
                  disabled={isLoading}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}

</div>

<Button
  type="submit"
  className="w-full py-6 bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium border-0 relative overflow-hidden group"
  disabled={isLoading}
>
  <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
  <span className="relative z-10 flex items-center justify-center">
    {isLoading ? "Initializing..." : "Create Account"}
    {!isLoading && <Terminal className="ml-2 h-4 w-4" />}
  </span>
</Button>

<div className="relative flex items-center py-2">
  <div className="flex-grow border-t border-[#323232]"></div>
  <span className="flex-shrink mx-3 text-gray-400 text-sm">or continue with</span>
  <div className="flex-grow border-t border-[#323232]"></div>
</div>

<Button
  variant="outline"
  type="button"
  className="w-full flex items-center justify-center gap-2 py-5 font-normal bg-[#232323] border-[#323232] text-gray-200 hover:bg-[#1a1a1a] hover:border-[#bcee45]/30 hover:text-white"
  onClick={handleGoogleSignup}
  disabled={isLoading}
>
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
  </svg>
  Sign up with Google
</Button>

<div className="text-center text-sm text-gray-500">
  By creating an account, you agree to our{" "}
  <Link href="/terms" className="text-[#bcee45] hover:text-[#dcff65] hover:underline">
    Terms of Service
  </Link>{" "}
  and{" "}
  <Link href="/privacy" className="text-[#bcee45] hover:text-[#dcff65] hover:underline">
    Privacy Policy
  </Link>
</div>
</form>
</CardContent>
</Card>
</motion.div>
);
}