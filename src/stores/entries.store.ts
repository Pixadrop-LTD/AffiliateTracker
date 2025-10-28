/**
 * Entries Store - Entry state management with Zustand
 * Mirrors the mobile app's entries store structure
 */

import type { EntryWithDerived } from "@/domain/models/entry";
import { calculateEntryDerived } from "@/domain/models/entry";
import { EntriesService } from "@/services";
import type { DocumentSnapshot } from "firebase/firestore";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface EntriesState {
    // State
    entries: EntryWithDerived[];
    selectedEntry: EntryWithDerived | null;
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    totalCount: number;
    lastDoc: DocumentSnapshot | null;

    // Dashboard data
    dashboardData: {
        totalSpend: number;
        totalEarnings: number;
        totalProfit: number;
        avgROI: number;
        entriesCount: number;
        dailyData: {
            date: string;
            spend: number;
            earnings: number;
            profit: number;
        }[];
    } | null;

    // Actions
    setEntries: (entries: EntryWithDerived[]) => void;
    setSelectedEntry: (entry: EntryWithDerived | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setHasMore: (hasMore: boolean) => void;
    setTotalCount: (count: number) => void;
    setDashboardData: (data: any) => void;

    // Async actions
    fetchEntries: (options?: { limitCount?: number; startDate?: Date; endDate?: Date; status?: string; uid?: string }) => Promise<void>;
    loadMoreEntries: () => Promise<void>;
    createEntry: (input: any) => Promise<string>;
    updateEntry: (id: string, updates: any) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    fetchEntryById: (id: string) => Promise<void>;
    fetchDashboardData: (startDate: Date, endDate: Date) => Promise<void>;

    // Utility actions
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    entries: [],
    selectedEntry: null,
    loading: false,
    error: null,
    hasMore: false,
    totalCount: 0,
    lastDoc: null,
    dashboardData: null,
};

export const useEntriesStore = create<EntriesState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Sync actions
            setEntries: (entries) => set({ entries }, false, "entries/setEntries"),

            setSelectedEntry: (selectedEntry) => set({ selectedEntry }, false, "entries/setSelectedEntry"),

            setLoading: (loading) => set({ loading }, false, "entries/setLoading"),

            setError: (error) => set({ error }, false, "entries/setError"),

            setHasMore: (hasMore) => set({ hasMore }, false, "entries/setHasMore"),

            setTotalCount: (totalCount) => set({ totalCount }, false, "entries/setTotalCount"),

            setDashboardData: (dashboardData) => set({ dashboardData }, false, "entries/setDashboardData"),

            // Async actions
            fetchEntries: async (options = {}) => {
                const { setLoading, setError, setEntries, setHasMore } = get();

                try {
                    setLoading(true);
                    setError(null);

                    console.log("fetchEntries called with options:", options);

                    const result = await EntriesService.getUserEntries(options.limitCount || 50, undefined, options.uid);

                    console.log("Entries fetched successfully:", result.entries.length, "entries");

                    setEntries(result.entries);
                    setHasMore(result.hasMore);
                    set({ lastDoc: result.lastDoc ?? null });
                } catch (error) {
                    console.error("Error fetching entries:", error);
                    setError(error instanceof Error ? error.message : "Failed to fetch entries");
                } finally {
                    setLoading(false);
                }
            },

            loadMoreEntries: async () => {
                const { setLoading, setError } = get();
                const { lastDoc } = get();

                if (!lastDoc) {
                    return;
                }

                try {
                    setLoading(true);
                    setError(null);

                    const result = await EntriesService.getUserEntries(50, lastDoc);

                    // Append
                    set((state) => ({ entries: [...state.entries, ...result.entries] }));
                    set({ lastDoc: result.lastDoc ?? null, hasMore: result.hasMore });
                } catch (error) {
                    setError(error instanceof Error ? error.message : "Failed to load more entries");
                } finally {
                    setLoading(false);
                }
            },

            createEntry: async (input: any) => {
                const { setLoading, setError } = get();

                try {
                    setLoading(true);
                    setError(null);

                    const entryId = await EntriesService.createEntry(input);

                    // Refresh entries list
                    await get().fetchEntries();

                    return entryId;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Failed to create entry";
                    setError(errorMessage);
                    throw new Error(errorMessage);
                } finally {
                    setLoading(false);
                }
            },

            updateEntry: async (id: string, updates: any) => {
                const { setLoading, setError, entries, setEntries, setSelectedEntry, selectedEntry } = get();

                try {
                    setLoading(true);
                    setError(null);

                    await EntriesService.updateEntry(id, updates);

                    // Update local state with recalculated derived fields
                    const updatedEntries = entries.map((entry) => {
                        if (entry.id !== id) return entry;
                        const merged: any = { ...entry, ...updates };
                        return calculateEntryDerived(merged);
                    });
                    setEntries(updatedEntries);

                    // Keep selectedEntry in sync if it's the one being edited
                    if (selectedEntry && selectedEntry.id === id) {
                        const mergedSelected: any = { ...selectedEntry, ...updates };
                        setSelectedEntry(calculateEntryDerived(mergedSelected) as EntryWithDerived);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Failed to update entry";
                    setError(errorMessage);
                    throw new Error(errorMessage);
                } finally {
                    setLoading(false);
                }
            },

            deleteEntry: async (id: string) => {
                const { setLoading, setError, entries, setEntries } = get();

                try {
                    setLoading(true);
                    setError(null);

                    await EntriesService.deleteEntry(id);

                    // Remove from local state
                    const filteredEntries = entries.filter((entry) => entry.id !== id);
                    setEntries(filteredEntries);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Failed to delete entry";
                    setError(errorMessage);
                    throw new Error(errorMessage);
                } finally {
                    setLoading(false);
                }
            },

            fetchEntryById: async (id: string) => {
                const { setLoading, setError, setSelectedEntry } = get();

                try {
                    setLoading(true);
                    setError(null);

                    const entry = await EntriesService.getEntry(id);
                    setSelectedEntry(entry);
                } catch (error) {
                    setError(error instanceof Error ? error.message : "Failed to fetch entry");
                } finally {
                    setLoading(false);
                }
            },

            fetchDashboardData: async (startDate: Date, endDate: Date) => {
                const { setLoading, setError, setDashboardData } = get();

                try {
                    setLoading(true);
                    setError(null);

                    const data = await EntriesService.getDashboardData(startDate, endDate);
                    setDashboardData(data);
                } catch (error) {
                    setError(error instanceof Error ? error.message : "Failed to fetch dashboard data");
                } finally {
                    setLoading(false);
                }
            },

            // Utility actions
            clearError: () => set({ error: null }, false, "entries/clearError"),

            reset: () => set(() => initialState, false, "entries/reset"),
        }),
        {
            name: "entries-store",
        }
    )
);
