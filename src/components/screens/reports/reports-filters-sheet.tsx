"use client";

/**
 * Reports Filters Sheet
 * Advanced filter sheet for reports with time range, grouping, and chart type options
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AnimatePresence, motion } from "framer-motion";
import { FiFilter } from "react-icons/fi";

type TimeRange = "7d" | "30d" | "90d" | "mtd" | "qtd" | "ytd" | "custom";
type GroupBy = "day" | "week" | "month";
type ChartType = "bar" | "pie" | "table";

interface ReportsFiltersSheetProps {
    timeRange: TimeRange;
    setTimeRange: (v: TimeRange) => void;
    groupBy: GroupBy;
    setGroupBy: (v: GroupBy) => void;
    chartType: ChartType;
    setChartType: (v: ChartType) => void;
    onReset: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const timeRanges: TimeRange[] = ["7d", "30d", "90d", "mtd", "qtd", "ytd"];
const groupByOptions: GroupBy[] = ["day", "week", "month"];
const chartTypes: ChartType[] = ["bar", "pie", "table"];

/**
 * @Description Reports filters sheet component
 * @Return {JSX.Element} The rendered filter sheet
 */
export const ReportsFiltersSheet = ({
    timeRange,
    setTimeRange,
    groupBy,
    setGroupBy,
    chartType,
    setChartType,
    onReset,
    open = false,
    onOpenChange,
}: ReportsFiltersSheetProps) => {
    // Calculate active filters count
    const activeFiltersCount = timeRange !== "30d" || groupBy !== "day" || chartType !== "bar" ? 3 : 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button variant="primary" outline size="sm">
                    <FiFilter className="mr-2 h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                        <Badge variant="primary" className="ml-2">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle>Report Filters</SheetTitle>
                            <SheetDescription className="mt-2">Customize your data view and analysis</SheetDescription>
                        </div>
                        <div className="rounded-full bg-primary/20 px-2 py-0.5">
                            <span className="text-xs font-bold text-primary">{activeFiltersCount}</span>
                        </div>
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Time Range */}
                    <AnimatePresence>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <h3 className="mb-3 text-sm font-medium">Time Range</h3>
                            <div className="flex flex-wrap gap-2">
                                {timeRanges.map((range) => (
                                    <Badge
                                        key={range}
                                        variant={timeRange === range ? "primary" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => setTimeRange(range)}
                                    >
                                        {range.toUpperCase()}
                                    </Badge>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Group By */}
                    <AnimatePresence>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                            <h3 className="mb-3 text-sm font-medium">Group By</h3>
                            <div className="flex flex-wrap gap-2">
                                {groupByOptions.map((g) => (
                                    <Badge
                                        key={g}
                                        variant={groupBy === g ? "secondary" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => setGroupBy(g)}
                                    >
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </Badge>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Chart Type */}
                    <AnimatePresence>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                            <h3 className="mb-3 text-sm font-medium">View As</h3>
                            <div className="flex flex-wrap gap-2">
                                {chartTypes.map((t) => (
                                    <Badge
                                        key={t}
                                        variant={chartType === t ? "accent" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => setChartType(t)}
                                    >
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </Badge>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
                    <div className="flex gap-2">
                        <Button variant="neutral" outline onClick={onReset} className="flex-1">
                            Reset
                        </Button>
                        <Button onClick={() => onOpenChange?.(false)} className="flex-1" variant="primary">
                            Apply
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
