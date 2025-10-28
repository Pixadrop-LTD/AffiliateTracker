import { ProtectedRoute } from "@/components/auth/protected-route";
import type { Metadata } from "next";
import { ReportsPageClient } from "./page-client";

/**
 * @Description Reports page metadata for SEO
 */
export const metadata: Metadata = {
    title: "Reports",
    description:
        "View detailed analytics and performance reports for your affiliate marketing campaigns. Track spending, earnings, profits, and ROI with advanced filtering and chart visualizations.",
    keywords: [
        "affiliate reports",
        "analytics",
        "performance tracking",
        "ROI analysis",
        "profit reports",
        "campaign metrics",
        "earnings tracking",
        "spending analysis",
        "affiliate marketing analytics",
    ],
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: "Reports | Affiliate Tracker",
        description: "View detailed analytics and performance reports for your affiliate marketing campaigns",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Reports | Affiliate Tracker",
        description: "View detailed analytics and performance reports for your affiliate marketing campaigns",
    },
};

/**
 * @Description Protected Reports Page with SEO metadata
 */
export default function ReportsPage() {
    return (
        <ProtectedRoute>
            <ReportsPageClient />
        </ProtectedRoute>
    );
}
