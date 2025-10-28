import { ProtectedRoute } from "@/components/auth/protected-route";
import type { Metadata } from "next";
import { SettingsPageClient } from "./page-client";

/**
 * @Description Settings page metadata for SEO
 */
export const metadata: Metadata = {
    title: "Settings",
    description:
        "Configure your affiliate tracking networks, ad platforms, and automation settings. Connect Facebook Ads, TikTok Ads, Newsbreak, MaxBounty, PerformCB, CashNetwork, and Point2Web to track your campaigns and earnings.",
    keywords: [
        "affiliate tracking",
        "ad network settings",
        "CPA network configuration",
        "Facebook Ads",
        "TikTok Ads",
        "campaign management",
        "affiliate marketing",
        "advertising platforms",
        "conversion tracking",
    ],
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: "Settings | Affiliate Tracker",
        description: "Configure your affiliate tracking networks and automation settings",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Settings | Affiliate Tracker",
        description: "Configure your affiliate tracking networks and automation settings",
    },
};

/**
 * @Description Protected Settings Page with SEO metadata
 */
export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsPageClient />
        </ProtectedRoute>
    );
}
