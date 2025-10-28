/**
 * Time Range Selector Component
 * Allows users to select date ranges for dashboard data
 */

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

export type TimeRange = "1d" | "7d" | "30d" | "custom";

type Props = {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
    customDate?: Date | null;
    onCustomDateChange?: (date: Date | null) => void;
};

/**
 * Time Range Selector Component
 */
export const TimeRangeSelector = ({ value, onChange, customDate, onCustomDateChange }: Props) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const ranges: { value: TimeRange; label: string }[] = [
        { value: "1d", label: "1D" },
        { value: "7d", label: "7D" },
        { value: "30d", label: "30D" },
    ];

    const handleCustomDateSelect = (date: Date) => {
        onCustomDateChange?.(date);
        onChange("custom");
        setShowDatePicker(false);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Preset ranges */}
            {ranges.map((range) => (
                <Button
                    key={range.value}
                    variant={value === range.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onChange(range.value)}
                    className={cn("h-8", value === range.value && "bg-primary-600 text-white hover:bg-primary-700")}
                >
                    {range.label}
                </Button>
            ))}

            {/* Custom date button */}
            <Button
                variant={value === "custom" ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowDatePicker(true)}
                className={cn("h-8", value === "custom" && "bg-primary-600 text-white hover:bg-primary-700")}
            >
                <CalendarIcon className="mr-1 size-4" />
                {customDate ? customDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Pick Date"}
            </Button>

            {/* Date picker modal */}
            {showDatePicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-xl">
                        <h3 className="mb-4 text-lg font-semibold">Select Date</h3>
                        <input
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                handleCustomDateSelect(date);
                            }}
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowDatePicker(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * @Description Helper to get date range from time range
 * @Params {TimeRange} range - The selected time range
 * @Params {Date | null} [customDate] - Optional custom date
 * @Return {{start: Date, end: Date, label: string}} Date range with label
 */
export const getDatesForRange = (range: TimeRange, customDate?: Date | null): { start: Date; end: Date; label: string } => {
    let end = new Date();
    let start = new Date(end);
    let label = "";

    switch (range) {
        case "1d":
            label = "1D";
            break;
        case "7d":
            start.setDate(end.getDate() - 6);
            label = "7 days";
            break;
        case "30d":
            start.setDate(end.getDate() - 29);
            label = "30 days";
            break;
        case "custom": {
            const base = customDate ?? new Date();
            start = new Date(base);
            end = new Date(base);
            label = base.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
            break;
        }
        default:
            label = "1D";
            break;
    }

    // Normalize to day boundaries
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end, label };
};

export default TimeRangeSelector;
