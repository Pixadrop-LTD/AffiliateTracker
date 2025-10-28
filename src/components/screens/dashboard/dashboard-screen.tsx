/**
 * Dashboard Screen Component
 * Client component that handles all dashboard logic and state
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { useEntriesStore } from "@/stores/entries.store";
import { motion } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EnhancedKpiCards } from "./enhanced-kpi-cards";
import { ProfitChart } from "./profit-chart";
import { RecentEntriesList } from "./recent-entries-list";
import type { TimeRange } from "./time-range-selector";
import TimeRangeSelector, { getDatesForRange } from "./time-range-selector";

/**
 * @Description Main dashboard screen component with KPI metrics, profit charts, and recent entries
 * @Return {JSX.Element} The dashboard UI
 */
export const DashboardScreen = () => {
    const { user, signOut } = useAuth();
    const { dashboardData, loading, fetchDashboardData, fetchEntries } = useEntriesStore();

    // State management
    const [timeRange, setTimeRange] = useState<TimeRange>("7d");
    const [customDate, setCustomDate] = useState<Date | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");

    // Calculate date range based on selection
    const { start, end, label } = useMemo(() => getDatesForRange(timeRange, customDate), [timeRange, customDate]);

    // User display data
    const userDisplayData = useMemo(() => {
        if (!user) return null;

        const displayName = user.displayName || user.email || "User";
        const initials = displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
        const photoURL = user.photoURL || undefined;

        return { displayName, initials, photoURL };
    }, [user]);

    // Fetch data when date range or auth state changes
    useEffect(() => {
        if (!user?.uid) return;

        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchDashboardData(start, end),
                    fetchEntries({ limitCount: 5, startDate: start, endDate: end }),
                ]);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchData();
    }, [user?.uid, start, end, fetchDashboardData, fetchEntries]);

    // Refresh handler with memoization
    const handleRefresh = useCallback(async () => {
        if (!user?.uid) return;

        setRefreshing(true);
        try {
            await Promise.all([
                fetchDashboardData(start, end),
                fetchEntries({ limitCount: 5, startDate: start, endDate: end }),
            ]);
        } catch (error) {
            console.error("Error refreshing dashboard:", error);
        } finally {
            setRefreshing(false);
        }
    }, [user?.uid, start, end, fetchDashboardData, fetchEntries]);

    return (
        <div className="min-h-screen bg-linear-to-br from-neutral-50 via-background to-primary-50/30">
            {/* Header Section */}
            <HeaderSection
                displayName={userDisplayData?.displayName}
                initials={userDisplayData?.initials}
                photoURL={userDisplayData?.photoURL}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onSignOut={signOut}
            />

            {/* Time Range Selector */}
            <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container mx-auto px-4 pb-6">
                    <TimeRangeSelector
                        value={timeRange}
                        onChange={setTimeRange}
                        customDate={customDate}
                        onCustomDateChange={setCustomDate}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    <EnhancedKpiCards data={dashboardData} currency="USD" periodLabel={label} loading={loading} />

                    <ProfitChart
                        data={dashboardData?.dailyData ?? []}
                        currency="USD"
                        label={label}
                        chartType={chartType}
                        onChartTypeChange={setChartType}
                    />

                    <RecentEntriesList loading={loading} limit={5} showViewAll />
                </div>
            </div>
        </div>
    );
};

/**
 * Loading screen component
 */
export const DashboardLoadingScreen = () => (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 via-primary-50/20 to-secondary-50">
        <div className="text-center">
            <div className="size-16 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
    </div>
);

/**
 * Header section with title, refresh button, and user avatar
 */
const HeaderSection = ({
    displayName,
    initials,
    photoURL,
    onRefresh,
    refreshing,
    onSignOut,
}: {
    displayName?: string;
    initials?: string;
    photoURL?: string;
    onRefresh: () => void;
    refreshing: boolean;
    onSignOut: () => void;
}) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden border-b border-primary/10 bg-linear-to-br from-white via-primary-50/20 to-accent-50/10 shadow-sm backdrop-blur-sm"
    >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-primary-500/5 via-transparent to-accent-500/5" />
        
        {/* Animated sparkle effect */}
        <div className="absolute right-20 top-4 opacity-20">
            <Sparkles className="size-8 text-primary-500 animate-pulse" />
        </div>

        <div className="relative container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                    </div>
                    <p className="mt-2 text-sm font-medium text-neutral-600">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex items-center gap-4"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="h-10 w-10 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
                    >
                        <RefreshCw className={refreshing ? "size-5 animate-spin text-primary-600" : "size-5 text-neutral-600"} />
                    </Button>
                    <motion.button
                        onClick={onSignOut}
                        className="group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="rounded-full border-2 border-primary-500 p-0.5 transition-all group-hover:border-primary-600 group-hover:shadow-lg">
                            <Avatar className="size-10">
                                <AvatarImage src={photoURL ?? undefined} alt={displayName} />
                                <AvatarFallback className="bg-linear-to-br from-primary-500 to-primary-600 text-white font-bold shadow-md">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </motion.button>
                </motion.div>
            </div>
        </div>
    </motion.div>
);

