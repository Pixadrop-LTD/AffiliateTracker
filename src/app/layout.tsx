import { Toaster } from "@/components/ui/sonner";
import { AppProviders } from "@/context";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "./layout-wrapper";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

/**
 * Root Layout Metadata
 * Global SEO configuration for the application
 */
export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
        default: "Affiliate Tracker",
        template: "%s | Affiliate Tracker",
    },
    description: "Track your affiliate marketing earnings, performance, and ROI with real-time analytics and insights.",
    keywords: [
        "affiliate marketing",
        "performance tracker",
        "advertising analytics",
        "CPA tracking",
        "ROI calculator",
        "affiliate management",
        "marketing dashboard",
    ],
    authors: [{ name: "Affiliate Tracker" }],
    creator: "Affiliate Tracker",
    publisher: "Affiliate Tracker",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        siteName: "Affiliate Tracker",
        title: "Affiliate Tracker - Track Your Marketing Performance",
        description: "Track your affiliate marketing earnings, performance, and ROI with real-time analytics.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Affiliate Tracker",
        description: "Track your affiliate marketing earnings and performance with real-time analytics",
        creator: "@affiliatetracker",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AppProviders>
                    <LayoutWrapper>{children}</LayoutWrapper>
                    <Toaster position="top-center" />
                </AppProviders>
            </body>
        </html>
    );
}
