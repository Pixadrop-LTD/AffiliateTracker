"use client";

/**
 * @Description TikTok Ads OAuth configuration dialog component
 * Implements OAuth flow to get access token like Facebook
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { motion } from "framer-motion";
import { useState } from "react";
import { IoCheckmarkCircle, IoCloseOutline, IoLogInOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { SiTiktok } from "react-icons/si";
import { toast } from "sonner";

interface TikTokAdsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Get TikTok App ID and App Secret from environment variables
const TIKTOK_APP_ID = process.env.NEXT_PUBLIC_TIKTOK_APP_ID;
const TIKTOK_APP_SECRET = process.env.TIKTOK_APP_SECRET;

/**
 * Exchange authorization code for access token via API route
 * Docs: https://ads.tiktok.com/marketing_api/docs?id=1739965703387137
 */
async function exchangeForAccessToken(authCode: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const res = await fetch("/api/tiktok/exchange-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            authCode,
            redirectUri: `${window.location.origin}/auth/tiktok/callback`,
        }),
    });

    const json: any = await res.json();
    if (!res.ok) {
        const message = json?.error || "Failed to exchange code for access token";
        throw new Error(message);
    }

    return json;
}

export const TikTokAdsDialog: React.FC<TikTokAdsDialogProps> = ({ open, onOpenChange }) => {
    const { preferences, updatePreferences } = useSettings();
    const [connecting, setConnecting] = useState(false);

    const isConfigured = Boolean(preferences?.adNetworks?.tiktok?.accessToken);

    /**
     * @Description Handle TikTok OAuth login using TikTok Business API
     * Docs: https://ads.tiktok.com/marketing_api/docs?id=1738373164380162
     * @Return {Promise<void>}
     */
    const handleConnect = async () => {
        if (!TIKTOK_APP_ID) {
            toast.error("Configuration Missing", {
                description: "TikTok App ID must be configured in .env.local file.",
            });
            return;
        }

        setConnecting(true);
        try {
            // TikTok Business API OAuth redirect
            const redirectUri = `${window.location.origin}/auth/tiktok/callback`;
            const scope = "ads.read ads.write"; // TikTok Business API scopes
            const state = Math.random().toString(36).substring(7); // Generate random state for CSRF protection
            sessionStorage.setItem("tiktok_oauth_state", state);

            // TikTok Business API OAuth URL
            const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_APP_ID}&scope=${encodeURIComponent(
                scope
            )}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

            // Open OAuth popup
            const popup = window.open(
                authUrl,
                "TikTok Login",
                "width=600,height=700,left=" + (window.screen.width / 2 - 300) + ",top=" + (window.screen.height / 2 - 350) + ",menubar=no,toolbar=no"
            );

            if (!popup) {
                toast.error("Popup blocked", {
                    description: "Please allow popups for this site to connect TikTok.",
                });
                setConnecting(false);
                return;
            }

            // Listen for message from callback page
            const messageListener = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;

                if (event.data.type === "TIKTOK_OAUTH_SUCCESS") {
                    const { authCode } = event.data;

                    // Exchange code for access token and save
                    (async () => {
                        try {
                            const result = await exchangeForAccessToken(authCode);

                            // Save to preferences
                            const existing = preferences?.adNetworks || {};
                            await updatePreferences(
                                {
                                    adNetworks: {
                                        ...existing,
                                        tiktok: {
                                            appId: TIKTOK_APP_ID,
                                            appSecret: TIKTOK_APP_SECRET,
                                            accessToken: result.accessToken,
                                            refreshToken: result.refreshToken,
                                            accessTokenExpiresAt: Date.now() + result.expiresIn * 1000,
                                        },
                                    },
                                },
                                { immediate: true }
                            );

                            toast.success("TikTok Ads connected successfully.");
                            onOpenChange(false);
                        } catch (error: any) {
                            toast.error("Token Exchange Failed", {
                                description: error?.message || "Could not exchange authorization code for access token.",
                            });
                        } finally {
                            setConnecting(false);
                        }
                    })();

                    window.removeEventListener("message", messageListener);
                    popup.close();
                } else if (event.data.type === "TIKTOK_OAUTH_ERROR") {
                    toast.error("Authorization Failed", {
                        description: event.data.error || "Failed to authorize with TikTok.",
                    });
                    setConnecting(false);
                    window.removeEventListener("message", messageListener);
                    popup.close();
                }
            };

            window.addEventListener("message", messageListener);

            // Listen for popup close
            const checkClosed = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener("message", messageListener);
                    setConnecting(false);
                }
            }, 1000);
        } catch (error: any) {
            toast.error("Connection Failed", {
                description: error?.message || "Could not connect to TikTok.",
            });
            setConnecting(false);
        }
    };

    /**
     * @Description Handle disconnect from TikTok
     * @Return {Promise<void>}
     */
    const handleDisconnect = async () => {
        const existing = preferences?.adNetworks || {};
        await updatePreferences(
            {
                adNetworks: {
                    ...existing,
                    tiktok: undefined,
                },
            },
            { immediate: true }
        );
        toast.success("Disconnected from TikTok Ads.");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] overflow-hidden">
                {/* Enhanced Header with Gradient Background */}
                <motion.div
                    className="absolute inset-x-0 top-0 h-32 bg-linear-to-br from-neutral-900 via-neutral-950 to-black"
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
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xl ring-4 ring-neutral-100/50">
                            <SiTiktok className="h-8 w-8 text-neutral-900" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-2xl font-bold text-white md:text-3xl">TikTok Ads</DialogTitle>
                            <DialogDescription className="text-sm text-white/90 md:text-base">
                                Connect and manage your TikTok advertising campaigns
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
                                <div className="absolute inset-0 bg-linear-to-br from-neutral-900/5 via-transparent to-accent-500/5" />
                                <div className="relative space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-neutral-900 to-black shadow-lg">
                                            <SiTiktok className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-lg font-bold text-neutral-900">Connect Your Account</h3>
                                            <p className="text-sm text-neutral-600">
                                                Authorize access to your TikTok Ads accounts to start tracking campaigns, spend, and performance
                                                metrics.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Authorization Details */}
                                    <div className="space-y-3 rounded-xl border-2 border-neutral-100 bg-linear-to-br from-neutral-50 to-neutral-100/30 p-5">
                                        <div className="flex items-center gap-2">
                                            <IoShieldCheckmarkOutline className="h-5 w-5 text-neutral-600" />
                                            <p className="text-sm font-semibold text-neutral-900">Permissions Requested:</p>
                                        </div>
                                        <ul className="space-y-2 pl-7">
                                            <li className="flex items-center gap-2 text-sm text-neutral-700">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                                                    1
                                                </span>
                                                View and manage ad campaigns
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-neutral-700">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                                                    2
                                                </span>
                                                Access advertiser accounts and data
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-neutral-700">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
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
                                    className="min-w-[180px] shadow-lg shadow-neutral-900/20 transition-all hover:shadow-xl hover:shadow-neutral-900/30"
                                >
                                    Connect with TikTok
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            {/* Connected State */}
                            <motion.div
                                className="relative overflow-hidden rounded-2xl border-2 border-green-200 bg-linear-to-br from-green-50 via-emerald-50 to-green-50/50 p-8 shadow-lg"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                            >
                                <div className="absolute inset-0 bg-linear-to-br from-green-500/5 via-transparent to-emerald-500/5" />
                                <div className="relative space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-green-500 to-green-600 shadow-xl ring-4 ring-green-100">
                                            <SiTiktok className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-neutral-900">Connected Successfully</h3>
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 shadow-sm">
                                                    <IoCheckmarkCircle className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-neutral-600">Your TikTok Ads account is connected and ready to use.</p>
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
