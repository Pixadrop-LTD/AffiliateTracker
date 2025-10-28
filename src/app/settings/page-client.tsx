"use client";

/**
 * @Description Settings page client component with Ads Networks and CPA Networks configuration
 */

import {
    CashNetworkDialog,
    FacebookAdsDialog,
    MaxBountyDialog,
    NewsbreakAdsDialog,
    PerformCBDialog,
    Point2WebDialog,
    TikTokAdsDialog,
} from "@/components/screens/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks";
import { useSettings } from "@/hooks/use-settings";
import { motion } from "framer-motion";
import { useState } from "react";
import { BiCheckCircle, BiDollarCircle, BiLeftArrowAlt, BiNetworkChart, BiRss, BiTrophy } from "react-icons/bi";
import { BsFacebook, BsLink45Deg } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { HiOutlineCurrencyDollar, HiOutlineLink } from "react-icons/hi";
import { SiTiktok } from "react-icons/si";

/**
 * @Description Settings item component with professional design using color palette
 */
interface SettingsItemProps {
    label: string;
    value: string;
    onClick: () => void;
    isConfigured?: boolean;
    icon?: React.ReactNode;
    iconColor?: "primary" | "secondary" | "accent";
}

const SettingsItem: React.FC<SettingsItemProps> = ({ label, value, onClick, isConfigured, icon, iconColor = "primary" }) => {
    const colorClasses = {
        primary: "from-primary-500 to-primary-600",
        secondary: "from-secondary-500 to-secondary-600",
        accent: "from-accent-500 to-accent-600",
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} whileHover={{ scale: 1.02 }}>
            <button
                onClick={onClick}
                className="group relative w-full overflow-hidden rounded-xl border-2 border-neutral-200 bg-white p-2 transition-all hover:border-primary/40 hover:shadow-xl md:rounded-2xl"
            >
                <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-5">
                        {/* Icon with color palette gradient */}
                        {icon && (
                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${colorClasses[iconColor]} shadow-md group-hover:scale-110 transition-transform md:h-14 md:w-14 md:rounded-xl md:shadow-lg`}
                            >
                                <div className="text-white text-xl md:text-2xl">{icon}</div>
                            </div>
                        )}

                        <div className="min-w-0 flex-1 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-base font-semibold text-neutral-900 group-hover:text-primary transition-colors md:text-lg">
                                    {label}
                                </p>
                                {isConfigured && (
                                    <span className="flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700 md:px-3 md:py-1">
                                        <BiCheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs font-medium text-neutral-500 md:mt-1 md:text-sm">{value}</p>
                        </div>
                    </div>

                    <BiLeftArrowAlt className="h-5 w-5 shrink-0 text-neutral-400 transition-all group-hover:translate-x-1 group-hover:text-primary md:h-6 md:w-6" />
                </div>
            </button>
        </motion.div>
    );
};

/**
 * @Description Enhanced settings section
 */
interface SettingsSectionProps {
    description?: string;
    children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ description, children }) => {
    return (
        <div className="space-y-3">
            {description && <p className="mb-4 text-sm font-medium text-neutral-600">{description}</p>}
            <div className="grid gap-4">{children}</div>
        </div>
    );
};

/**
 * @Description Settings skeleton component with shimmer effect
 */
const SettingsSkeleton = () => {
    return (
        <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
        </div>
    );
};

/**
 * @Description Settings page client component
 */
export const SettingsPageClient = () => {
    const { user, signOut } = useAuth();
    const { preferences, isLoading } = useSettings();

    // Dialog states for Ads Networks
    const [facebookDialogOpen, setFacebookDialogOpen] = useState(false);
    const [newsbreakDialogOpen, setNewsbreakDialogOpen] = useState(false);
    const [tiktokDialogOpen, setTikTokDialogOpen] = useState(false);

    // Dialog states for CPA Networks
    const [maxBountyDialogOpen, setMaxBountyDialogOpen] = useState(false);
    const [performCbDialogOpen, setPerformCbDialogOpen] = useState(false);
    const [cashNetworkDialogOpen, setCashNetworkDialogOpen] = useState(false);
    const [point2WebDialogOpen, setPoint2WebDialogOpen] = useState(false);

    // Check configuration status
    const isFacebookConfigured = Boolean(preferences?.adNetworks?.facebook?.accessToken);
    const isNewsbreakConfigured = Boolean(preferences?.adNetworks?.newsbreak?.token || (preferences?.adNetworks?.newsbreak?.orgIds || []).length > 0);
    const isTikTokConfigured = Boolean(preferences?.adNetworks?.tiktok?.accessToken);
    const isMaxBountyConfigured = Boolean(preferences?.cpaNetworks?.maxBounty?.email || preferences?.cpaNetworks?.maxBounty?.password);
    const isPerformCbConfigured = Boolean(preferences?.cpaNetworks?.performCb?.apiKey || preferences?.cpaNetworks?.performCb?.partnerId);
    const isCashNetworkConfigured = Boolean(preferences?.cpaNetworks?.cashNetwork?.apiKey);
    const isPoint2WebConfigured = Boolean(preferences?.cpaNetworks?.point2Web?.apiKey);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-neutral-50 via-primary-50/10 to-secondary-50/10 p-4 pb-28">
                <div className="container mx-auto max-w-5xl space-y-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        <div className="mb-6">
                            <Skeleton className="h-10 w-64 mb-2" />
                            <Skeleton className="h-5 w-96" />
                        </div>
                        <SettingsSkeleton />
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-neutral-50 px-4 py-6 pb-28 md:px-6">
                <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
                    {/* Header Section */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:rounded-2xl md:p-6">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-primary-600 shadow-md md:h-12 md:w-12 md:rounded-xl">
                                    <FiSettings className="h-5 w-5 text-white md:h-6 md:w-6" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-xl font-semibold text-neutral-900 md:text-2xl">Settings</h1>
                                    <p className="mt-0.5 text-xs text-neutral-500 md:text-sm">Manage your integrations and preferences</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Ads Networks Section */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                        <Card className="relative overflow-hidden border-2 border-neutral-200 bg-white shadow-xl">
                            {/* Accent border top */}
                            <div className="h-1 w-full bg-linear-to-r from-primary-500 via-accent-500 to-secondary-500" />

                            <CardHeader className="border-b border-neutral-100 pb-4 md:pb-6">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-primary-600 shadow-md md:h-12 md:w-12 md:rounded-xl">
                                        <BiRss className="h-5 w-5 text-white md:h-6 md:w-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-xl font-bold text-neutral-900 md:text-2xl">Ads Networks</CardTitle>
                                        <CardDescription className="text-xs md:text-sm">
                                            Connect your advertising networks to track campaigns
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="py-4 md:py-6">
                                <SettingsSection>
                                    <SettingsItem
                                        label="Facebook Ads"
                                        value={isFacebookConfigured ? "Configured and ready" : "Not configured"}
                                        onClick={() => setFacebookDialogOpen(true)}
                                        isConfigured={isFacebookConfigured}
                                        icon={<BsFacebook />}
                                        iconColor="primary"
                                    />
                                    <SettingsItem
                                        label="Newsbreak Ads"
                                        value={isNewsbreakConfigured ? "Configured and ready" : "Not configured"}
                                        onClick={() => setNewsbreakDialogOpen(true)}
                                        isConfigured={isNewsbreakConfigured}
                                        icon={<BsLink45Deg />}
                                        iconColor="accent"
                                    />
                                    <SettingsItem
                                        label="TikTok Ads"
                                        value={isTikTokConfigured ? "Configured and ready" : "Not configured"}
                                        onClick={() => setTikTokDialogOpen(true)}
                                        isConfigured={isTikTokConfigured}
                                        icon={<SiTiktok />}
                                        iconColor="primary"
                                    />
                                </SettingsSection>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* CPA Networks Section */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                        <Card className="relative overflow-hidden border-2 border-neutral-200 bg-white shadow-xl">
                            {/* Accent border top */}
                            <div className="h-1 w-full bg-linear-to-r from-secondary-500 via-accent-500 to-primary-500" />

                            <CardHeader className="border-b border-neutral-100 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-secondary-500 to-secondary-600 shadow-md">
                                        <HiOutlineCurrencyDollar className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-neutral-900">CPA Networks</CardTitle>
                                        <CardDescription>Connect your CPA networks to track conversions and earnings</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="py-4 md:py-6">
                                <SettingsSection>
                                    <SettingsItem
                                        label="MaxBounty"
                                        value={isMaxBountyConfigured ? "Configured and ready" : "Not configured"}
                                        onClick={() => setMaxBountyDialogOpen(true)}
                                        isConfigured={isMaxBountyConfigured}
                                        icon={<BiTrophy />}
                                        iconColor="accent"
                                    />
                                    <SettingsItem
                                        label="PerformCB"
                                        value={isPerformCbConfigured ? "Configured and ready" : "Not configured"}
                                        onClick={() => setPerformCbDialogOpen(true)}
                                        isConfigured={isPerformCbConfigured}
                                        icon={<BiNetworkChart />}
                                        iconColor="secondary"
                                    />
                                    <SettingsItem
                                        label="CashNetwork"
                                        value={isCashNetworkConfigured ? "Configured and ready" : "Not configured"}
                                        onClick={() => setCashNetworkDialogOpen(true)}
                                        isConfigured={isCashNetworkConfigured}
                                        icon={<BiDollarCircle />}
                                        iconColor="primary"
                                    />
                                    <SettingsItem
                                        label="Point2Web"
                                        value={isPoint2WebConfigured ? "Configured and ready" : "Not configured"}
                                        onClick={() => setPoint2WebDialogOpen(true)}
                                        isConfigured={isPoint2WebConfigured}
                                        icon={<HiOutlineLink />}
                                        iconColor="accent"
                                    />
                                </SettingsSection>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Account Section */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                        <Card className="relative overflow-hidden border-2 border-neutral-200 bg-white shadow-xl">
                            <div className="h-1 w-full bg-linear-to-r from-accent-500 via-neutral-400 to-accent-500" />

                            <CardHeader className="border-b border-neutral-100 pb-6">
                                <CardTitle className="text-2xl font-bold text-neutral-900">Account</CardTitle>
                                <CardDescription>Manage your account settings</CardDescription>
                            </CardHeader>

                            <CardContent className="py-4 md:py-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-xl border-2 border-neutral-100 bg-white p-6 transition-all hover:border-primary/40">
                                        <div className="flex items-center gap-5">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-lg">
                                                <span className="text-2xl font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-neutral-900">User Information</p>
                                                <p className="text-sm font-medium text-neutral-500">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={signOut}
                                        variant="destructive"
                                        size="default"
                                        className="w-full text-sm font-semibold shadow-lg transition-all hover:shadow-xl md:text-base md:font-bold"
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Dialogs */}
            <FacebookAdsDialog open={facebookDialogOpen} onOpenChange={setFacebookDialogOpen} />
            <NewsbreakAdsDialog open={newsbreakDialogOpen} onOpenChange={setNewsbreakDialogOpen} />
            <MaxBountyDialog open={maxBountyDialogOpen} onOpenChange={setMaxBountyDialogOpen} />
            <PerformCBDialog open={performCbDialogOpen} onOpenChange={setPerformCbDialogOpen} />
            <CashNetworkDialog open={cashNetworkDialogOpen} onOpenChange={setCashNetworkDialogOpen} />
            <Point2WebDialog open={point2WebDialogOpen} onOpenChange={setPoint2WebDialogOpen} />
            <TikTokAdsDialog open={tiktokDialogOpen} onOpenChange={setTikTokDialogOpen} />
        </>
    );
};
