"use client";

/**
 * @Description Facebook Ads OAuth configuration dialog component
 * Implements OAuth flow to get access token like mobile app
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BsFacebook } from "react-icons/bs";
import { IoCheckmarkCircle, IoCloseOutline, IoLogInOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { toast } from "sonner";

interface FacebookAdsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Get Facebook App ID from environment variables
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

/**
 * Load Facebook JavaScript SDK dynamically
 */
function loadFacebookSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
        const win = window as any;

        // Check if SDK is already loaded
        if (win.FB) {
            resolve();
            return;
        }

        // Check if script is already being loaded
        if (document.getElementById("facebook-jssdk")) {
            const checkInterval = setInterval(() => {
                if (win.FB) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            return;
        }

        // Create and load the SDK
        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";

        // Initialize FB SDK when loaded
        win.fbAsyncInit = function () {
            win.FB.init({
                appId: FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: "v23.0",
            });
            resolve();
        };

        script.onerror = () => {
            reject(new Error("Failed to load Facebook SDK"));
        };

        document.body.appendChild(script);
    });
}

/**
 * Exchange a short-lived user access token for a long-lived token via API route
 * Docs: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/
 */
async function exchangeForLongLivedToken(shortToken: string): Promise<{ accessToken: string; expiresIn?: number }> {
    const res = await fetch("/api/facebook/exchange-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ shortToken }),
    });

    const json: any = await res.json();
    if (!res.ok) {
        const message = json?.error || "Failed to exchange token for long-lived token";
        throw new Error(message);
    }

    return json;
}

export const FacebookAdsDialog: React.FC<FacebookAdsDialogProps> = ({ open, onOpenChange }) => {
    const { preferences, updatePreferences } = useSettings();
    const [connecting, setConnecting] = useState(false);

    const isConfigured = Boolean(preferences?.adNetworks?.facebook?.accessToken);

    /**
     * @Description Handle disconnect from Facebook
     * @Return {Promise<void>}
     */
    const handleDisconnect = async () => {
        const existing = preferences?.adNetworks || {};
        await updatePreferences(
            {
                adNetworks: {
                    ...existing,
                    facebook: undefined,
                },
            },
            { immediate: true }
        );
        toast.success("Disconnected from Facebook Ads.");
    };

    /**
     * @Description Handle Facebook OAuth login
     * @Return {Promise<void>}
     */
    const handleConnect = async () => {
        if (!FACEBOOK_APP_ID) {
            toast.error("Configuration Missing", {
                description: "Facebook App ID must be configured in .env.local file.",
            });
            return;
        }

        setConnecting(true);
        try {
            // Load Facebook SDK dynamically
            await loadFacebookSDK();

            // Trigger Facebook OAuth login
            const win = window as any;
            win.FB.login(
                (response: any) => {
                    // Handle response in async IIFE
                    (async () => {
                        if (response.status === "connected") {
                            const shortToken = response.authResponse.accessToken;

                            try {
                                // Exchange for long-lived token via API route
                                const exchanged = await exchangeForLongLivedToken(shortToken);
                                const longToken = exchanged.accessToken;
                                const expiresIn = exchanged.expiresIn;

                                // Save to preferences
                                const existing = preferences?.adNetworks || {};
                                await updatePreferences(
                                    {
                                        adNetworks: {
                                            ...existing,
                                            facebook: {
                                                appId: FACEBOOK_APP_ID,
                                                accessToken: longToken,
                                                accessTokenExpiresAt: typeof expiresIn === "number" ? Date.now() + expiresIn * 1000 : undefined,
                                            },
                                        },
                                    },
                                    { immediate: true }
                                );

                                toast.success("Facebook Ads connected successfully.");
                                onOpenChange(false);
                                setConnecting(false);
                            } catch (ex: any) {
                                toast.error("Token Exchange Failed", {
                                    description: ex?.message || "Could not get long-lived token.",
                                });
                                setConnecting(false);
                            }
                        } else if (response.status === "not_authorized") {
                            toast.error("Authorization Failed", {
                                description: "You did not authorize the app.",
                            });
                            setConnecting(false);
                        } else {
                            toast.info("Login Cancelled", {
                                description: "Facebook login was cancelled.",
                            });
                            setConnecting(false);
                        }
                    })();
                },
                {
                    scope: "public_profile,email,ads_read,ads_management,business_management",
                    return_scopes: true,
                }
            );
        } catch (error: any) {
            toast.error("Connection Failed", {
                description: error?.message || "Could not connect to Facebook.",
            });
            setConnecting(false);
        }
    };

    // Load Facebook SDK on mount
    useEffect(() => {
        const win = window as any;
        if (open && !win.FB) {
            loadFacebookSDK();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] overflow-hidden">
                {/* Enhanced Header with Gradient Background */}
                <motion.div
                    className="absolute inset-x-0 top-0 h-32 bg-linear-to-br from-primary-500 via-primary-600 to-primary-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />

                <DialogHeader className="relative space-y-4 pt-6">
                    <motion.div
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xl ring-4 ring-primary-100/50">
                            <BsFacebook className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-2xl font-bold text-white md:text-3xl">Facebook Ads</DialogTitle>
                            <DialogDescription className="text-sm text-white/90 md:text-base">
                                Connect and manage your advertising campaigns
                            </DialogDescription>
                        </div>
                    </motion.div>
                </DialogHeader>

                <div className="space-y-6 pt-2 pb-6">
                    {!isConfigured ? (
                        <>
                            {/* Connection Card */}
                            <motion.div
                                className="relative overflow-hidden rounded-2xl border-2 border-neutral-200 bg-linear-to-br from-white to-neutral-50 p-8 shadow-xl"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                            >
                                <div className="absolute inset-0 bg-linear-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
                                <div className="relative space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-600 shadow-lg">
                                            <BsFacebook className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-lg font-bold text-neutral-900">Connect Your Account</h3>
                                            <p className="text-sm text-neutral-600">
                                                Authorize access to your Facebook Ads accounts to start tracking campaigns, spend, and performance
                                                metrics.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Authorization Details */}
                                    <div className="space-y-3 rounded-xl border-2 border-primary-100 bg-gradient-to-br from-primary-50 to-primary-100/30 p-5">
                                        <div className="flex items-center gap-2">
                                            <IoShieldCheckmarkOutline className="h-5 w-5 text-primary-600" />
                                            <p className="text-sm font-semibold text-primary-900">Permissions Requested:</p>
                                        </div>
                                        <ul className="space-y-2 pl-7">
                                            <li className="flex items-center gap-2 text-sm text-primary-800">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    1
                                                </span>
                                                View ad campaigns and spend data
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-primary-800">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    2
                                                </span>
                                                Access business and ad accounts
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-primary-800">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    3
                                                </span>
                                                Read performance metrics and insights
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Security Note */}
                                    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
                                        <IoShieldCheckmarkOutline className="h-5 w-5 shrink-0 text-accent" />
                                        <div className="space-y-1 text-xs text-neutral-600">
                                            <p className="font-semibold">Your data is secure</p>
                                            <p>
                                                All credentials are encrypted and stored securely. We never share your information with third parties.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <DialogFooter className="gap-3">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => onOpenChange(false)}
                                    outline
                                    rightIcon={IoCloseOutline}
                                    size="lg"
                                    disabled={connecting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleConnect}
                                    loading={connecting}
                                    disabled={connecting}
                                    rightIcon={IoLogInOutline}
                                    className="min-w-[180px] shadow-lg shadow-primary-500/20 transition-all hover:shadow-xl hover:shadow-primary-500/30"
                                >
                                    Connect with Facebook
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            {/* Connected State */}
                            <motion.div
                                className="relative overflow-hidden rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50/50 p-8 shadow-lg"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                            >
                                <div className="absolute inset-0 bg-linear-to-br from-green-500/5 via-transparent to-emerald-500/5" />
                                <div className="relative space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-green-500 to-green-600 shadow-xl ring-4 ring-green-100">
                                            <BsFacebook className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-neutral-900">Connected Successfully</h3>
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 shadow-sm">
                                                    <IoCheckmarkCircle className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-neutral-600">Your Facebook Ads account is connected and ready to use.</p>
                                        </div>
                                    </div>

                                    {/* Status Info */}
                                    <div className="rounded-xl border-2 border-green-200 bg-white/50 p-5 backdrop-blur-sm">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-neutral-700">Connection Status</span>
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Active</span>
                                            </div>
                                            <div className="h-px bg-green-100" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-neutral-700">Data Sync</span>
                                                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                                                    Enabled
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <DialogFooter className="gap-2">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => onOpenChange(false)}
                                    outline
                                    rightIcon={IoCloseOutline}
                                    size="lg"
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={handleConnect}
                                    loading={connecting}
                                    disabled={connecting}
                                    rightIcon={IoLogInOutline}
                                    size="lg"
                                >
                                    Reconnect
                                </Button>
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={handleDisconnect}
                                    outline
                                    size="lg"
                                    className="text-destructive hover:text-destructive"
                                >
                                    Disconnect
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
