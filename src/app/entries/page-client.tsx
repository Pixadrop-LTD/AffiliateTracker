"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { EntryCard } from "@/components/screens/entries/entry-card";
import { EntriesListSkeleton } from "@/components/screens/entries/entry-skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EntryWithDerived } from "@/domain/models/entry";
import { useAuth } from "@/hooks";
import { useEntriesStore } from "@/stores";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiFilter, FiPlus, FiSearch } from "react-icons/fi";

type SortField = "date" | "spend" | "earnings" | "revenue" | "profit" | "roi";
type SortDirection = "asc" | "desc";
type EntryStatus = "all" | "active" | "archived";

/**
 * @Description Main entries page with advanced filtering and state management
 * @Return {JSX.Element} The rendered entries page
 */
const EntriesPageContent = () => {
    const { user, isAuthenticated, isInitializing } = useAuth();
    const router = useRouter();

    // Zustand store
    const { entries: allEntries, loading, error, fetchEntries, loadMoreEntries } = useEntriesStore();

    // Local state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<EntryStatus>("all");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [showFilters, setShowFilters] = useState(false);

    // Load entries on mount
    useEffect(() => {
        // Only fetch entries when authentication is confirmed and not initializing
        if (isAuthenticated && !isInitializing && user?.uid) {
            console.log("Fetching entries for authenticated user:", user.uid);
            fetchEntries({ limitCount: 50, uid: user.uid });
        }
    }, [isAuthenticated, isInitializing, user?.uid, fetchEntries]);

    // Debug: Log entries when they change
    useEffect(() => {
        console.log("=== ENTRIES DEBUG ===");
        console.log("Auth state - isAuthenticated:", isAuthenticated, "isInitializing:", isInitializing);
        console.log("Entries count:", allEntries.length);
        console.log("Loading:", loading);
        console.log("Error:", error);
        if (allEntries.length > 0) {
            console.log("First entry structure:", allEntries[0]);
            console.log("First entry date type:", typeof allEntries[0].date, allEntries[0].date);
            console.log("First entry has toDate?:", "toDate" in allEntries[0].date);
        } else {
            console.log("No entries in store yet");
        }
    }, [allEntries, loading, error, isAuthenticated, isInitializing]);

    // Calculate active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (searchQuery.trim()) count++;
        if (statusFilter !== "all") count++;
        return count;
    }, [searchQuery, statusFilter]);

    /**
     * @Description Gets effective revenue from entry (prefers revenue over earnings).
     * @Params {EntryWithDerived} entry - The entry to get revenue from
     * @Return {number} The effective revenue
     */
    const getEffectiveRevenue = (entry: EntryWithDerived): number => {
        return entry.revenue ?? entry.earnings ?? 0;
    };

    /**
     * @Description Gets effective spend from entry.
     * @Params {EntryWithDerived} entry - The entry to get spend from
     * @Return {number} The effective spend
     */
    const getEffectiveSpend = (entry: EntryWithDerived): number => {
        return entry.spend ?? 0;
    };

    /**
     * @Description Filters and sorts entries client-side.
     */
    const filteredEntries = useMemo(() => {
        if (!allEntries) return [];

        const q = searchQuery.trim().toLowerCase();

        const result = allEntries
            .filter((entry: EntryWithDerived) => {
                // Search by notes
                if (q && !(entry.notes || "").toLowerCase().includes(q)) return false;

                // Status filter
                if (statusFilter !== "all" && entry.status !== statusFilter) return false;

                return true;
            })
            .sort((a: EntryWithDerived, b: EntryWithDerived) => {
                let cmp = 0;
                switch (sortField) {
                    case "date": {
                        // Handle both Timestamp and Date types
                        const aDate = "toDate" in a.date && typeof a.date.toDate === "function" ? a.date.toDate() : (a.date as unknown as Date);
                        const bDate = "toDate" in b.date && typeof b.date.toDate === "function" ? b.date.toDate() : (b.date as unknown as Date);
                        cmp = aDate.getTime() - bDate.getTime();
                        break;
                    }
                    case "spend":
                        cmp = getEffectiveSpend(a) - getEffectiveSpend(b);
                        break;
                    case "earnings":
                    case "revenue":
                        cmp = getEffectiveRevenue(a) - getEffectiveRevenue(b);
                        break;
                    case "profit":
                        cmp =
                            (a.profit ?? getEffectiveRevenue(a) - getEffectiveSpend(a)) - (b.profit ?? getEffectiveRevenue(b) - getEffectiveSpend(b));
                        break;
                    case "roi": {
                        const aRoi =
                            getEffectiveSpend(a) > 0 ? ((getEffectiveRevenue(a) - getEffectiveSpend(a)) / getEffectiveSpend(a)) * 100 : -Infinity;
                        const bRoi =
                            getEffectiveSpend(b) > 0 ? ((getEffectiveRevenue(b) - getEffectiveSpend(b)) / getEffectiveSpend(b)) * 100 : -Infinity;
                        cmp = aRoi - bRoi;
                        break;
                    }
                }
                return sortDirection === "desc" ? -cmp : cmp;
            });

        return result;
    }, [allEntries, searchQuery, statusFilter, sortField, sortDirection]);

    const displayName = user?.displayName || user?.email || "User";

    return (
        <div className="min-h-screen bg-linear-to-br from-neutral-50 via-background to-primary-50/30 p-4 pb-28">
            <div className="container mx-auto space-y-6">
                {/* Enhanced Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-primary">Entries</h1>
                                <p className="mt-1 text-sm font-medium text-neutral-600">
                                    {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"}
                                </p>
                            </div>
                            {activeFiltersCount > 0 && (
                                <Badge variant="primary" size="sm" className="animate-fade-in">
                                    {activeFiltersCount} {activeFiltersCount === 1 ? "filter" : "filters"} active
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Avatar className="size-10 border-2 border-primary-500">
                                <AvatarFallback className="bg-linear-to-br from-primary-100 to-primary-200 text-primary-700 font-semibold">
                                    {displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Button onClick={() => router.push("/add")} variant="primary" size="default">
                                <FiPlus className="size-4" />
                                Add Entry
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filter Bar */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EntryStatus)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="primary" size="icon" onClick={() => setShowFilters(!showFilters)} className="relative">
                            <FiFilter className="size-4" />
                            {activeFiltersCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-secondary-600 text-[10px] font-bold text-white">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </motion.div>

                {/* Advanced Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-primary-200 bg-linear-to-br from-primary-50/50 to-primary-100/30">
                            <CardContent className="p-6">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-primary">Sort By</label>
                                        <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="spend">Spend</SelectItem>
                                                <SelectItem value="earnings">Earnings</SelectItem>
                                                <SelectItem value="revenue">Revenue</SelectItem>
                                                <SelectItem value="profit">Profit</SelectItem>
                                                <SelectItem value="roi">ROI</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-primary">Direction</label>
                                        <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirection)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="desc">Descending</SelectItem>
                                                <SelectItem value="asc">Ascending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Entries List */}
                {loading ? (
                    <EntriesListSkeleton count={8} />
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-8"
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-primary-100/20">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h2 className="mb-2 text-center text-2xl font-bold text-primary">Failed to load entries</h2>
                        <p className="mb-6 text-center text-neutral-600">{error}</p>
                        <Button variant="primary" onClick={() => fetchEntries()}>
                            Retry
                        </Button>
                    </motion.div>
                ) : filteredEntries.length > 0 ? (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-3 py-8">
                            {filteredEntries.map((entry, index: number) => {
                                // Convert Firestore Timestamp to Date
                                let entryDate: Date;
                                if (
                                    entry.date &&
                                    typeof entry.date === "object" &&
                                    "toDate" in entry.date &&
                                    typeof (entry.date as any).toDate === "function"
                                ) {
                                    entryDate = (entry.date as any).toDate();
                                } else if (entry.date instanceof Date) {
                                    entryDate = entry.date;
                                } else if (typeof entry.date === "string" || typeof entry.date === "number") {
                                    entryDate = new Date(entry.date);
                                } else {
                                    entryDate = new Date();
                                }

                                return (
                                    <motion.div
                                        key={entry.id || `entry-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="w-full"
                                    >
                                        <EntryCard
                                            entry={{
                                                id: entry.id || `entry-${index}`,
                                                date: entryDate,
                                                status: entry.status,
                                                spend: entry.spend,
                                                revenue: entry.revenue,
                                                earnings: entry.earnings,
                                                profit: entry.profit,
                                                roiPct: entry.roiPct,
                                                notes: entry.notes,
                                                currency: entry.currency || "USD",
                                            }}
                                        />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                        {/* Load More Button */}
                        {filteredEntries.length >= 10 && (
                            <div className="flex justify-center">
                                <Button variant="secondary" onClick={() => loadMoreEntries()} disabled={loading}>
                                    {loading ? "Loading..." : "Load More"}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-8"
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-linear-to-br from-primary-100 to-primary-50">
                            <span className="text-4xl">📊</span>
                        </div>
                        <h2 className="mb-2 text-center text-2xl font-bold text-primary">
                            {searchQuery || statusFilter !== "all" ? "No matching entries" : "Ready to track your success?"}
                        </h2>
                        <p className="mb-8 text-center text-neutral-600">
                            {searchQuery || statusFilter !== "all"
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Start by adding your first affiliate marketing entry to begin tracking your performance."}
                        </p>
                        <Button
                            onClick={
                                searchQuery || statusFilter !== "all"
                                    ? () => {
                                          setSearchQuery("");
                                          setStatusFilter("all");
                                      }
                                    : () => router.push("/add")
                            }
                            variant="primary"
                        >
                            {searchQuery || statusFilter !== "all" ? "Clear All Filters" : "Add Your First Entry"}
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

/**
 * @Description Protected Entries Page
 * @Return {JSX.Element} The protected entries page
 */
const EntriesPageClient = () => {
    return (
        <ProtectedRoute>
            <EntriesPageContent />
        </ProtectedRoute>
    );
};

export default EntriesPageClient;
