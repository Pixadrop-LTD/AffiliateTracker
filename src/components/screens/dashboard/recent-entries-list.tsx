/**
 * Recent Entries List Component
 * Displays the most recent entries in a list format
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EntryWithDerived } from "@/domain/models/entry";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ChevronRight, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type Props = {
    entries?: EntryWithDerived[] | null;
    loading?: boolean;
    limit?: number;
    showViewAll?: boolean;
};

/**
 * Entry card component
 */
const EntryCard = ({ entry }: { entry: EntryWithDerived }) => {
    const router = useRouter();
    const effectiveRevenue = entry.revenue ?? entry.earnings ?? 0;
    const profit = entry.profit ?? effectiveRevenue - entry.spend;
    const isPositive = profit >= 0;
    const date = entry.date instanceof Date ? entry.date : entry.date.toDate?.() ?? new Date();

    return (
        <button
            onClick={() => {
                if (entry.id) {
                    router.push(`/entries/${entry.id}`);
                }
            }}
            className="group flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all hover:bg-accent/50 hover:shadow-sm"
        >
            <div className="flex-1">
                <p className="font-medium text-foreground group-hover:text-primary">{formatDate(date, "short")}</p>
                <p className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { weekday: "long" })}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <Badge variant={isPositive ? "success" : "error"} size="xs">
                        {formatCurrency(profit, "USD")}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {formatCurrency(entry.spend, "USD")} / {formatCurrency(effectiveRevenue, "USD")}
                    </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
        </button>
    );
};

/**
 * Entry card skeleton
 */
const EntryCardSkeleton = () => (
    <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-4">
            <div className="space-y-2 text-right">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="size-4" />
        </div>
    </div>
);

/**
 * Recent Entries List Component
 */
export const RecentEntriesList = ({ entries, loading, limit = 5, showViewAll = true }: Props) => {
    const router = useRouter();

    // Get limited entries
    const displayEntries = useMemo(() => {
        if (!entries || entries.length === 0) return [];
        return entries.slice(0, limit);
    }, [entries, limit]);

    if (loading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <h3 className="text-lg font-semibold">Recent Entries</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: limit }).map((_, i) => (
                        <EntryCardSkeleton key={i} />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!displayEntries || displayEntries.length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <h3 className="text-lg font-semibold">Recent Entries</h3>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <List className="mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No recent entries. Add your first entry to get started.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <h3 className="text-lg font-semibold">Recent Entries</h3>
                {showViewAll && (
                    <Button variant="ghost" size="sm" onClick={() => router.push("/entries")} className="text-primary-600 hover:text-primary-700">
                        View All
                        <ChevronRight className="ml-1 size-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                {displayEntries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} />
                ))}
            </CardContent>
        </Card>
    );
};

export default RecentEntriesList;
