import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FiCalendar, FiMic } from "react-icons/fi";
import Link from "next/link";
import { ProfitLossBadge } from "./profit-loss-badge";

interface EntryCardProps {
    entry: {
        id: string;
        date: Date;
        status: "active" | "archived";
        spend: number;
        revenue?: number;
        earnings?: number;
        profit?: number;
        roiPct?: number | null;
        notes?: string;
        currency: string;
    };
}

/**
 * @Description Formats a number as currency.
 * @Params {number} amount - The amount to format.
 * @Params {number} decimals - Number of decimal places.
 * @Params {string} currency - Currency code.
 * @Return {string} Formatted currency string.
 */
const formatCurrency = (amount: number, decimals: number = 2, currency: string = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount);
};

/**
 * @Description Formats a date to a readable string.
 * @Params {Date} date - The date to format.
 * @Return {string} Formatted date string.
 */
const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
};

/**
 * @Description Gets effective revenue from entry (prefers revenue over earnings).
 * @Params {EntryCardProps['entry']} entry - The entry object.
 * @Return {number} Effective revenue value.
 */
const getEffectiveRevenue = (entry: EntryCardProps["entry"]): number => {
    return entry.revenue ?? entry.earnings ?? 0;
};

/**
 * @Description Gets effective spend from entry.
 * @Params {EntryCardProps['entry']} entry - The entry object.
 * @Return {number} Effective spend value.
 */
const getEffectiveSpend = (entry: EntryCardProps["entry"]): number => {
    return entry.spend ?? 0;
};

/**
 * @Description Individual entry card component displaying key metrics.
 * @Params {Object} props - The component props.
 * @Params {Object} props.entry - The entry data to display.
 * @Return {JSX.Element} The rendered entry card.
 */
export const EntryCard = ({ entry }: EntryCardProps) => {
    const effectiveRevenue = getEffectiveRevenue(entry);
    const effectiveSpend = getEffectiveSpend(entry);
    const profit = entry.profit ?? effectiveRevenue - effectiveSpend;

    const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);

    return (
        <Card className="overflow-hidden border border-secondary-100 bg-secondary-50/10 transition-all hover:border-primary-300 hover:shadow-lg">
            <Link href={`/entries/${entry.id}`}>
                <CardContent className="p-4">
                    {/* Header - status and date */}
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex flex-1 items-center">
                            <div className="mr-2 rounded-lg bg-primary-100/20 p-2">
                                <FiMic className="h-4 w-4 text-primary-600" />
                            </div>
                            <div
                                className={cn(
                                    "rounded-full border px-2.5 py-1",
                                    entry.status === "active"
                                        ? "border-emerald-300/50 bg-linear-to-r from-emerald-50 to-emerald-100/30"
                                        : "border-neutral-300/50 bg-linear-to-r from-neutral-200/40 to-neutral-100/20"
                                )}
                            >
                                <span
                                    className={cn("text-[10px] font-semibold", entry.status === "active" ? "text-emerald-700" : "text-neutral-600")}
                                >
                                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <FiCalendar className="mr-1 h-3.5 w-3.5 text-neutral-500" />
                            <span className="text-xs font-medium text-neutral-600">{formatDate(entryDate)}</span>
                            <ProfitLossBadge profit={profit} size="xs" className="ml-2" />
                        </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="mb-3 flex justify-between rounded-lg bg-neutral-100/50 p-3">
                        <div className="flex-1 pr-2">
                            <div className="mb-1 flex items-center">
                                <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">Spend</span>
                            </div>
                            <p className="text-base font-extrabold text-red-600">{formatCurrency(effectiveSpend, 2, entry.currency)}</p>
                        </div>
                        <div className="flex-1">
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">Revenue</p>
                            <p className="text-base font-bold text-emerald-600">{formatCurrency(effectiveRevenue, 2, entry.currency)}</p>
                        </div>
                        <div className="flex-1">
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">Profit</p>
                            <p className={cn("text-base font-bold", profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                                {formatCurrency(profit, 2, entry.currency)}
                            </p>
                        </div>
                    </div>

                    {/* ROI Badge */}
                    <div className="flex items-center justify-between">
                        <div
                            className={cn(
                                "rounded-lg px-3 py-2",
                                entry.roiPct && entry.roiPct >= 0
                                    ? "border border-emerald-300/50 bg-linear-to-r from-emerald-50 to-emerald-100/20"
                                    : "border border-red-300/50 bg-linear-to-r from-red-50 to-red-100/20"
                            )}
                        >
                            <p className={cn("text-sm font-bold", entry.roiPct && entry.roiPct >= 0 ? "text-emerald-700" : "text-red-700")}>
                                ROI: {entry.roiPct !== null && entry.roiPct !== undefined ? `${entry.roiPct.toFixed(1)}%` : "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Notes if available */}
                    {entry.notes && (
                        <div className="mt-3 rounded-md bg-neutral-50/50 p-2">
                            <p className="text-xs text-neutral-700 line-clamp-2">{entry.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Link>
        </Card>
    );
};
