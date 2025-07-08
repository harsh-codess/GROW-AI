"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useEffect } from "react";

export default function YouTubeCallback() {
  useEffect(() => {
    // Extract code, error and state from URL
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    // Use the state parameter for redirection (this is our return URL)
    const returnUrl = searchParams.get("state");

    // Function to handle redirection
    const handleRedirection = () => {
      // If we have a return URL in the state parameter, use it
      if (returnUrl) {
        try {
          // Add the code or error to the return URL as query params
          const redirectUrl = new URL(returnUrl, window.location.origin);
          if (code) {
            redirectUrl.searchParams.set("code", code);
            redirectUrl.searchParams.set("youtube_auth", "true");
          }
          if (error) {
            redirectUrl.searchParams.set("error", error);
            redirectUrl.searchParams.set(
              "error_description",
              searchParams.get("error_description") || "Authentication failed"
            );
            redirectUrl.searchParams.set("youtube_auth", "true");
          }
          // Redirect to the original app
          window.location.href = redirectUrl.toString();
          return;
        } catch (e) {
          console.error("Invalid return URL in state parameter", e);
          // If return URL is invalid, fall back to popup behavior
        }
      }

      // If no redirect URI or it's invalid, try postMessage (popup flow)
      if (error) {
        // If there's an error, send it to the parent window
        window.opener?.postMessage(
          {
            type: "YOUTUBE_AUTH_CALLBACK",
            error: error,
            error_description:
              searchParams.get("error_description") || "Authentication failed",
          },
          window.location.origin
        );
      } else if (code) {
        // Send code back to parent window
        window.opener?.postMessage(
          {
            type: "YOUTUBE_AUTH_CALLBACK",
            code,
          },
          window.location.origin
        );
      } else {
        // If no code found, send an error message
        window.opener?.postMessage(
          {
            type: "YOUTUBE_AUTH_CALLBACK",
            error: "No authentication code received",
          },
          window.location.origin
        );
      }
      // Close window after handling
      setTimeout(() => window.close(), 500);
    };

    // Give a small delay to ensure the UI renders before redirecting
    setTimeout(handleRedirection, 1000);
  }, []);

  // Better loading state with the app's styling
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200 text-center">
        <h1 className="text-2xl mb-4 text-gray-800">YouTube Authentication</h1>
        <div className="flex justify-center mb-4">
          <LoadingSpinner/>
        </div>
        <p className="text-purple-600">Connecting your account...</p>
      </div>
    </div>
  );
}