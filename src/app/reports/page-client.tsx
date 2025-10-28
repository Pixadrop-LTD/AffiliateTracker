"use client";

/**
 * Reports Page Client Component
 * Advanced analytics and reporting with filters, charts, and data visualization
 * Mirrors mobile app functionality with web-optimized UI
 */

import { ReportsFiltersSheet } from "@/components/screens/reports/reports-filters-sheet";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import {
    calculateTotals,
    filterEntriesByDateRange,
    formatCurrency,
    getBarColor,
    getChartColors,
    getDateRange,
    processChartData,
} from "@/lib/utils/reports";
import { useAuthStore, useFilterStore } from "@/stores";
import { startOfMonth, startOfQuarter, startOfYear, subDays } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HiTrendingUp } from "react-icons/hi";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type TimeRange = "7d" | "30d" | "90d" | "mtd" | "qtd" | "ytd" | "custom";
type GroupBy = "day" | "week" | "month";
type ChartType = "bar" | "pie" | "table";

/**
 * @Description Main reports page client component
 * @Return {JSX.Element} The rendered reports page
 */
export const ReportsPageClient = () => {
    const { user } = useAuthStore();
    const { entries, loadEntries, loading } = useEntries();
    const { reportFilters, setReportFilters, resetReportFilters } = useFilterStore();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Get current settings
    const timeRange = reportFilters.dateRange.preset === "custom" ? "custom" : (reportFilters.dateRange.preset?.toLowerCase() as TimeRange) || "30d";
    const groupBy = reportFilters.groupBy as GroupBy;
    const chartType = reportFilters.chartType || "bar";

    // Calculate date range based on filters
    const dateRange = useMemo(() => {
        if (timeRange === "custom" && reportFilters.dateRange.start && reportFilters.dateRange.end) {
            return {
                startDate: reportFilters.dateRange.start,
                endDate: reportFilters.dateRange.end,
            };
        }
        return getDateRange(timeRange);
    }, [timeRange, reportFilters.dateRange]);

    // Fetch entries on mount
    useEffect(() => {
        if (entries.length === 0) {
            loadEntries(250);
        } else {
            setIsInitialLoad(false);
        }
    }, [entries.length, loadEntries]);

    // Update initial load state when data arrives
    useEffect(() => {
        if (entries.length > 0 && loading === false) {
            setIsInitialLoad(false);
        }
    }, [entries.length, loading]);

    // Filter and process entries
    const filteredEntries = useMemo(() => {
        if (entries.length === 0) return [];

        return filterEntriesByDateRange(entries, dateRange.startDate, dateRange.endDate).filter((entry) => {
            if (reportFilters.includeArchived) return true;
            return entry.status === "active";
        });
    }, [entries, dateRange.startDate, dateRange.endDate, reportFilters.includeArchived]);

    // Process chart data
    const chartData = useMemo(() => {
        if (filteredEntries.length === 0) return [];
        return processChartData(filteredEntries, groupBy);
    }, [filteredEntries, groupBy]);

    // Calculate totals
    const totals = useMemo(() => {
        return calculateTotals(filteredEntries);
    }, [filteredEntries]);

    const totalProfit = totals.earnings - totals.spend;
    const totalROI = totals.spend > 0 ? (totalProfit / totals.spend) * 100 : 0;
    const currency = filteredEntries[0]?.currency || "USD";

    // Time range options
    const timeRangeOrder: TimeRange[] = ["7d", "30d", "90d", "mtd", "qtd", "ytd"];
    const nextTimeRange = (current: TimeRange): TimeRange => {
        const idx = Math.max(0, timeRangeOrder.indexOf(current));
        return timeRangeOrder[(idx + 1) % timeRangeOrder.length];
    };

    // Chart type options
    const chartTypes: ChartType[] = ["bar", "pie", "table"];
    const nextChartType = (current: ChartType): ChartType => {
        const idx = Math.max(0, chartTypes.indexOf(current));
        return chartTypes[(idx + 1) % chartTypes.length];
    };

    // Group by options
    const groupByOptions: GroupBy[] = ["day", "week", "month"];
    const nextGroupBy = (current: GroupBy): GroupBy => {
        const idx = Math.max(0, groupByOptions.indexOf(current));
        return groupByOptions[(idx + 1) % groupByOptions.length];
    };

    const applyTimeRange = (v: TimeRange) => {
        const now = new Date();
        let start = new Date(now);

        switch (v) {
            case "7d":
                start = subDays(now, 7);
                break;
            case "30d":
                start = subDays(now, 30);
                break;
            case "90d":
                start = subDays(now, 90);
                break;
            case "mtd":
                start = startOfMonth(now);
                break;
            case "qtd":
                start = startOfQuarter(now);
                break;
            case "ytd":
                start = startOfYear(now);
                break;
            case "custom":
                setReportFilters({
                    dateRange: { ...reportFilters.dateRange, preset: "custom" },
                });
                return;
        }

        const preset = v === "mtd" ? "MTD" : v === "qtd" ? "QTD" : v === "ytd" ? "YTD" : v;
        setReportFilters({
            dateRange: { start, end: now, preset: preset as "7d" | "30d" | "90d" | "MTD" | "QTD" | "YTD" },
        });
    };

    // Render chart based on type
    const renderChart = () => {
        if (chartData.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <HiTrendingUp className="mb-4 h-16 w-16 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-semibold text-primary">
                        {timeRange !== "30d" || groupBy !== "day" || chartType !== "bar" ? "No matching data" : "Ready to get insights?"}
                    </h3>
                    <p className="mb-8 text-muted-foreground">
                        {timeRange !== "30d" || groupBy !== "day" || chartType !== "bar"
                            ? "Try adjusting your filters or time range to find what you need."
                            : "Add your first entry to generate performance reports and insights."}
                    </p>
                    <Button
                        onClick={
                            timeRange !== "30d" || groupBy !== "day" || chartType !== "bar"
                                ? () => {
                                      resetReportFilters();
                                      setReportFilters({ chartType: "bar" });
                                  }
                                : () => {}
                        }
                        variant="default"
                    >
                        {timeRange !== "30d" || groupBy !== "day" || chartType !== "bar" ? "Clear All Filters" : "Add Your First Entry"}
                    </Button>
                </div>
            );
        }

        if (chartType === "pie") {
            const config = {
                profit: {
                    label: "Profit",
                    color: "hsl(var(--chart-1))",
                },
            };

            return (
                <ChartContainer config={config}>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ x, profit }) => `${x}: ${formatCurrency(profit, currency)}`}
                                outerRadius={120}
                                innerRadius={60}
                                fill="#8884d8"
                                dataKey="profit"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getChartColors()[index % getChartColors().length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            );
        } else if (chartType === "bar") {
            const config = {
                profit: {
                    label: "Profit",
                    color: "hsl(var(--chart-1))",
                },
            };

            return (
                <ChartContainer config={config}>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="x"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                style={{ fontSize: "12px" }}
                                interval={Math.floor(chartData.length / 10)}
                            />
                            <YAxis tickFormatter={(value) => formatCurrency(value, currency)} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.profit)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            );
        } else {
            // Table view
            return (
                <div className="space-y-2 overflow-x-auto">
                    <div className="grid grid-cols-5 gap-4 border-b pb-2 text-sm font-semibold">
                        <div className="col-span-2 capitalize">{groupBy}</div>
                        <div className="text-right">Spend</div>
                        <div className="text-right">Earnings</div>
                        <div className="text-right">Profit</div>
                    </div>
                    {chartData.map((item, index) => (
                        <div key={index} className="grid grid-cols-5 items-center gap-4 border-b py-3 text-sm transition-colors hover:bg-muted/50">
                            <div className="col-span-2 font-medium">{item.x}</div>
                            <div className="text-right text-destructive">{formatCurrency(item.spend, currency)}</div>
                            <div className="text-right text-secondary">{formatCurrency(item.earnings, currency)}</div>
                            <div className={`text-right font-semibold ${item.profit >= 0 ? "text-secondary" : "text-destructive"}`}>
                                {formatCurrency(item.profit, currency)} ({item.roi.toFixed(1)}%)
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-background to-primary-50/30 p-4 pb-28">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 bg-clip-text text-transparent">
                            Reports
                        </h1>
                        <p className="mt-2 text-muted-foreground">Performance insights at a glance.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {user && (
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Avatar className="border-3 border-primary-500 shadow-lg ring-2 ring-primary-200">
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                                </Avatar>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Filter Chips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-wrap items-center gap-2"
                >
                    <Badge
                        variant={timeRange === reportFilters.dateRange.preset?.toLowerCase() ? "primary" : "outline"}
                        className="cursor-pointer border-2 font-semibold transition-all hover:scale-110 hover:shadow-md"
                        onClick={() => applyTimeRange(nextTimeRange(timeRange))}
                    >
                        {timeRange.toUpperCase()}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="cursor-pointer border-2 font-semibold transition-all hover:scale-110 hover:shadow-md"
                        onClick={() => setReportFilters({ groupBy: nextGroupBy(groupBy) })}
                    >
                        {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="cursor-pointer border-2 font-semibold transition-all hover:scale-110 hover:shadow-md"
                        onClick={() => setReportFilters({ chartType: nextChartType(chartType) })}
                    >
                        {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                    </Badge>
                    <ReportsFiltersSheet
                        timeRange={timeRange}
                        setTimeRange={applyTimeRange}
                        groupBy={groupBy}
                        setGroupBy={(g) => setReportFilters({ groupBy: g })}
                        chartType={chartType}
                        setChartType={(t) => setReportFilters({ chartType: t })}
                        onReset={() => {
                            resetReportFilters();
                            setReportFilters({ chartType: "bar" });
                        }}
                        open={isFilterOpen}
                        onOpenChange={setIsFilterOpen}
                    />
                    {(timeRange as string) !== "30d" || groupBy !== "day" || chartType !== "bar" ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="font-semibold"
                            onClick={() => {
                                resetReportFilters();
                                setReportFilters({ chartType: "bar" });
                            }}
                        >
                            Clear all
                        </Button>
                    ) : null}
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <Card className="border-3 border-primary-200 bg-gradient-to-br from-primary-50 to-white shadow-xl hover:shadow-2xl transition-all">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-semibold uppercase tracking-wide text-primary-700">Entries</CardDescription>
                                <CardTitle className="text-3xl font-extrabold text-primary-600">{totals.count}</CardTitle>
                            </CardHeader>
                        </Card>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <Card className="border-3 border-red-200 bg-gradient-to-br from-red-50 to-white shadow-xl hover:shadow-2xl transition-all">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-semibold uppercase tracking-wide text-red-700">Total Spend</CardDescription>
                                <CardTitle className="text-3xl font-extrabold text-destructive">
                                    {isInitialLoad ? <Skeleton className="h-8 w-24" /> : formatCurrency(totals.spend, currency)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <Card className="border-3 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-xl hover:shadow-2xl transition-all">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                    Total Earnings
                                </CardDescription>
                                <CardTitle className="text-3xl font-extrabold text-secondary">
                                    {isInitialLoad ? <Skeleton className="h-8 w-24" /> : formatCurrency(totals.earnings, currency)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <Card
                            className={`border-3 shadow-xl hover:shadow-2xl transition-all ${
                                totalProfit >= 0
                                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                                    : "border-red-200 bg-gradient-to-br from-red-50 to-white"
                            }`}
                        >
                            <CardHeader className="pb-2">
                                <CardDescription
                                    className={`text-xs font-semibold uppercase tracking-wide ${
                                        totalProfit >= 0 ? "text-emerald-700" : "text-red-700"
                                    }`}
                                >
                                    Net Profit
                                </CardDescription>
                                <CardTitle className={`text-3xl font-extrabold ${totalProfit >= 0 ? "text-secondary" : "text-destructive"}`}>
                                    {isInitialLoad ? <Skeleton className="h-8 w-32" /> : formatCurrency(totalProfit, currency)}
                                </CardTitle>
                                <p className={`mt-2 text-sm font-semibold ${totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    {isInitialLoad ? (
                                        <Skeleton className="h-4 w-20" />
                                    ) : (
                                        <>
                                            {totalROI >= 0 ? "+" : ""}
                                            {totalROI.toFixed(1)}% ROI
                                        </>
                                    )}
                                </p>
                            </CardHeader>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                    <Card className="border-3 border-primary-200 bg-gradient-to-br from-white to-primary-50/30 shadow-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 bg-clip-text text-transparent">
                                        {groupBy === "day" && "Daily"}
                                        {groupBy === "week" && "Weekly"}
                                        {groupBy === "month" && "Monthly"} Performance
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium">Financial metrics over time</CardDescription>
                                </div>
                                <div className="flex gap-2 rounded-xl bg-gradient-to-r from-primary-100 to-accent-100 p-1 shadow-inner">
                                    {chartTypes.map((t) => (
                                        <Button
                                            key={t}
                                            variant={chartType === t ? "default" : "ghost"}
                                            size="sm"
                                            className="font-semibold transition-all hover:scale-105"
                                            onClick={() => setReportFilters({ chartType: t })}
                                        >
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isInitialLoad ? (
                                <div className="flex h-96 items-center justify-center">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                </div>
                            ) : (
                                renderChart()
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};
