"use client";
import { useEffect, useState } from "react";
import {LoadingSpinner} from "@/components/ui/loading-spinner"

export default function InstagramCallbackPage() {
  // Combine status and message from previous version
  const [status, setStatus] = useState("Processing"); // Processing, Success, Error
  const [message, setMessage] = useState("Verifying authorization...");
  const [debugInfo, setDebugInfo] = useState(""); // For error debugging

  useEffect(() => {
    console.log("[INSTA CALLBACK] Page loaded. Processing redirect...");

    const processCallback = () => {
      // --- Start Processing ---
      setStatus("Processing");
      setMessage("Verifying authorization...");
      let debugMessages = []; // Initialize debug messages

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");
      const receivedState = urlParams.get("state");

      debugMessages.push(`Code present: ${!!code}`);
      debugMessages.push(`Error present: ${!!error}`);
      debugMessages.push(`State: ${receivedState || "none"}`);

      let targetReturnUrl = null;
      let isIOSSafariFlow = false;
      let validationError = null; // Store validation errors

      // --- Determine flow type and get target return URL ---
      if (receivedState && receivedState.startsWith("ios_safari_")) {
        isIOSSafariFlow = true;
        debugMessages.push("Flow: iOS Safari Special");
        console.log("[INSTA CALLBACK] iOS Safari flow detected.");
        const storedTimestamp = sessionStorage.getItem(
          "instagram_auth_timestamp"
        );
        targetReturnUrl = sessionStorage.getItem("instagram_return_url");
        debugMessages.push(
          `Return URL from session: ${targetReturnUrl || "none"}`
        );

        if (!storedTimestamp || !receivedState.includes(storedTimestamp)) {
          validationError =
            "Invalid authentication state (iOS Timestamp mismatch). Please try connecting again.";
          targetReturnUrl = null;
        }
        if (!validationError && !targetReturnUrl) {
          validationError =
            "Could not determine where to return (Missing iOS Session URL). Please try again.";
        }
        // Clear session storage immediately
        sessionStorage.removeItem("instagram_auth_timestamp");
        sessionStorage.removeItem("instagram_return_url");
      } else if (receivedState) {
        debugMessages.push("Flow: Standard");
        console.log("[INSTA CALLBACK] Standard flow detected.");
        try {
          targetReturnUrl = decodeURIComponent(receivedState);
          debugMessages.push(
            `Return URL from state: ${targetReturnUrl || "none"}`
          );
          if (
            !targetReturnUrl ||
            (!targetReturnUrl.startsWith("/") &&
              !targetReturnUrl.startsWith("http"))
          ) {
            validationError =
              "Invalid return destination encoded in state. Please try again.";
            targetReturnUrl = null;
          }
        } catch (e) {
          validationError =
            "Failed to decode return destination state. Please try again.";
          targetReturnUrl = null;
        }
      } else {
        debugMessages.push("Flow: Unknown (Missing State)");
        validationError =
          "Authentication state missing from redirect. Please try again.";
        targetReturnUrl = null;
      }

      // Update debug info state early
      setDebugInfo(debugMessages.join("\n"));

      // --- Handle Validation Errors ---
      if (validationError) {
        console.error("[INSTA CALLBACK] Validation Error:", validationError);
        setStatus("Error");
        setMessage(validationError);
        // No redirect possible
        return;
      }

      // --- Handle Direct Error from Instagram ---
      if (error) {
        console.error("[INSTA CALLBACK] Error received from Instagram:", error);
        setStatus("Error");
        setMessage(
          `Authentication error from Instagram: ${decodeURIComponent(error)}`
        );
        // Attempt to redirect back with the error, otherwise stay here
        if (targetReturnUrl) {
          try {
            const errorRedirectUrlObj = new URL(
              targetReturnUrl,
              window.location.origin
            );
            errorRedirectUrlObj.searchParams.set("error", error); // Pass error back
            errorRedirectUrlObj.searchParams.set("instagram_auth", "true"); // Add marker
            const finalErrorRedirectUrl = errorRedirectUrlObj.toString();
            console.log(
              "[INSTA CALLBACK] Redirecting back with error:",
              finalErrorRedirectUrl
            );
            window.location.replace(finalErrorRedirectUrl); // Redirect immediately
            return; // Stop further processing
          } catch (e) {
            console.error(
              "[INSTA CALLBACK] Error constructing error redirect URL:",
              e
            );
            setMessage(
              `Auth error: ${decodeURIComponent(
                error
              )}. Failed to redirect back automatically.`
            );
            // Stay on this page
            return;
          }
        }
        // Stay on this page if no targetReturnUrl
        return;
      }

      // --- Handle Missing Code (if no error present) ---
      if (!code) {
        console.error("[INSTA CALLBACK] No code received from Instagram.");
        setStatus("Error");
        setMessage(
          "Authorization code missing from Instagram response. Please try again."
        );
        // Stay on this page, redirection not useful without code/error
        return;
      }

      // --- Construct Final Success Redirect URL ---
      // (Only if no validation or Instagram errors occurred and code exists)
      let finalRedirectUrl = null;
      if (targetReturnUrl && code) {
        try {
          const redirectUrlObj = new URL(
            targetReturnUrl,
            window.location.origin
          );
          redirectUrlObj.searchParams.set("code", code); // Pass code back
          redirectUrlObj.searchParams.set("instagram_auth", "true"); // Add marker
          finalRedirectUrl = redirectUrlObj.toString();
          console.log(
            "[INSTA CALLBACK] Final success redirect URL:",
            finalRedirectUrl
          );
        } catch (e) {
          console.error(
            "[INSTA CALLBACK] Error constructing final success redirect URL:",
            e
          );
          setStatus("Error");
          setMessage(
            "Successfully authenticated, but failed to construct the return URL."
          );
          finalRedirectUrl = null; // Prevent redirect
        }
      } else {
        // Should not happen if previous checks passed, but as a safeguard
        console.error(
          "[INSTA CALLBACK] Cannot construct redirect URL (missing target or code)."
        );
        setStatus("Error");
        setMessage("An unexpected error occurred preparing the redirect.");
      }

      // --- Perform Redirect ---
      if (finalRedirectUrl) {
        setStatus("Success"); // Visually indicate success before navigating
        setMessage("Redirecting back to the application...");
        // Use replace to avoid callback page in history
        window.location.replace(finalRedirectUrl);
      } else {
        // Stay on this page and show error
        // Status and Message should already be set to Error state
        console.error(
          "[INSTA CALLBACK] Cannot redirect due to previous errors."
        );
      }
    };

    // Run processing after a brief moment
    const timer = setTimeout(processCallback, 200); // Slightly longer delay

    return () => clearTimeout(timer); // Cleanup timer
  }, []); // No dependencies

  // --- JSX Rendering ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200 text-center max-w-md w-full">
        {/* Heading based on Status */}
        <h1 className="text-2xl mb-4">
          {status === "Processing" && "Processing Instagram Authentication"}
          {status === "Success" && "Authentication Successful!"}
          {status === "Error" && "Connection Error"}
        </h1>

        {/* Icon based on Status */}
        <div className="flex justify-center mb-4">
          {status === "Processing" && ( // Show spinner only during initial processing
            <LoadingSpinner />
          )}
          {status === "Success" && ( // Show checkmark on success before redirect
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          )}
          {status === "Error" && ( // Show cross on error
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          )}
        </div>

        {/* Message Paragraph */}
        <p
          className={`mb-4 ${
            status === "Error" ? "text-red-400" : "text-purple-600"
          }`}
        >
          {message}
        </p>

        {/* Debug Info Area (Only show on Error) */}
        {status === "Error" && debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left max-h-40 overflow-y-auto">
            <p className="text-xs text-gray-400 mb-2">Debug Information:</p>
            <pre className="text-xs text-gray-500 whitespace-pre-wrap break-words">
              {debugInfo}
            </pre>
          </div>
        )}

        {/* Footer Text */}
        <p className="text-sm text-gray-400 mt-4">
          {status !== "Error"
            ? "You will be redirected automatically..."
            : "Please close this window/tab and try connecting again."}
        </p>
      </div>
    </div>
  );
}