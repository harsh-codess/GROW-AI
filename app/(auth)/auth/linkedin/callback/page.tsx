"use client";

import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LinkedInCallback() {
  useEffect(() => {
    // Extract code, error and state from URL
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");
    const errorDescription = searchParams.get("error_description");

    // Function to handle redirection
    const handleRedirection = () => {
      try {
        // First decode the state parameter to get the return URL
        const stateData = state ? JSON.parse(Buffer.from(state, 'base64').toString()) : null;
        const returnUrl = stateData?.returnUrl || '/dashboard/analytics'; // Default fallback
        
        // Add the code or error to the return URL
        const redirectUrl = new URL(returnUrl, window.location.origin);
        
        if (code) {
          redirectUrl.searchParams.set("code", code);
          redirectUrl.searchParams.set("linkedinState", state || '');
          redirectUrl.searchParams.set("linkedin_auth", "true");
        }
        
        if (error) {
          redirectUrl.searchParams.set("error", error);
          
          if (errorDescription) {
            redirectUrl.searchParams.set("error_description", errorDescription);
          }
          
          redirectUrl.searchParams.set("linkedin_auth", "true");
        }
        
        // Redirect to the dashboard
        window.location.href = redirectUrl.toString();
      } catch (e) {
        console.error("Error processing LinkedIn callback:", e);
        
        // If there's an error parsing the state, just redirect to the analytics page
        const fallbackUrl = new URL('/dashboard/analytics', window.location.origin);
        
        if (code) {
          fallbackUrl.searchParams.set("code", code);
          fallbackUrl.searchParams.set("linkedin_auth", "true");
        }
        
        if (error) {
          fallbackUrl.searchParams.set("error", error);
          fallbackUrl.searchParams.set("linkedin_auth", "true");
        }
        
        window.location.href = fallbackUrl.toString();
      }
    };

    // Give a small delay to ensure the UI renders before redirecting
    setTimeout(handleRedirection, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200 text-center">
        <h1 className="text-2xl mb-4 text-gray-800">LinkedIn Authentication</h1>
        <div className="flex justify-center mb-4">
          <LoadingSpinner />
        </div>
        <p className="text-purple-600">Processing authentication...</p>
        <p className="text-sm text-gray-500 mt-4">You will be redirected automatically</p>
      </div>
    </div>
  );
}