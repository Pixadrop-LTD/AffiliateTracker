"use client";

/**
 * @Description TikTok OAuth callback handler page
 * Receives authorization code from TikTok and posts it back to parent window
 */

import { useEffect, useState } from "react";

export default function TikTokCallbackPage() {
    const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
    const [message, setMessage] = useState("Processing authorization...");

    useEffect(() => {
        // Get authorization code and state from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        // Verify state matches what we sent
        const savedState = sessionStorage.getItem("tiktok_oauth_state");
        sessionStorage.removeItem("tiktok_oauth_state");

        if (error) {
            setStatus("error");
            setMessage(errorDescription || "Authorization failed");

            // Notify parent window of error
            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: "TIKTOK_OAUTH_ERROR",
                        error: errorDescription || error,
                    },
                    window.location.origin
                );
            }

            setTimeout(() => window.close(), 2000);
            return;
        }

        if (!code) {
            setStatus("error");
            setMessage("No authorization code received");

            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: "TIKTOK_OAUTH_ERROR",
                        error: "No authorization code received",
                    },
                    window.location.origin
                );
            }

            setTimeout(() => window.close(), 2000);
            return;
        }

        if (!state || state !== savedState) {
            setStatus("error");
            setMessage("Invalid state parameter");

            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: "TIKTOK_OAUTH_ERROR",
                        error: "Invalid state parameter",
                    },
                    window.location.origin
                );
            }

            setTimeout(() => window.close(), 2000);
            return;
        }

        // Success - send code to parent window
        setStatus("success");
        setMessage("Authorization successful!");

        if (window.opener) {
            window.opener.postMessage(
                {
                    type: "TIKTOK_OAUTH_SUCCESS",
                    authCode: code,
                },
                window.location.origin
            );
        }

        // Close window after short delay
        setTimeout(() => window.close(), 1000);
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 p-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl border-2 border-neutral-200 bg-white p-8 shadow-xl">
                <div className="flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900">
                        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-6 3.21-1.43.05-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57 0-5.36-.03-.25-.07-.52-.25-.68-.23-.09-.5-.13-.75-.09-.9.14-1.83.33-2.67.89-1.22.92-1.99 2.3-2 3.84 0 1.15-.08 2.29-.33 3.41-.67 2.97-3.31 5.19-6.43 5.19-1.91 0-3.82-.77-5.18-2.15-2.07-2.07-2.88-5.16-2.26-8.04.87-4.04 4.37-7.12 8.4-7.4 2.18-.15 4.38.26 6.16 1.37.15.09.27.21.41.31.28.23.59.42.88.63z" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-3 text-center">
                    {status === "processing" && (
                        <>
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
                            <h2 className="text-xl font-bold text-neutral-900">Processing Authorization</h2>
                            <p className="text-sm text-neutral-600">{message}</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-green-900">Success!</h2>
                            <p className="text-sm text-green-700">{message}</p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-red-900">Authorization Failed</h2>
                            <p className="text-sm text-red-700">{message}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
