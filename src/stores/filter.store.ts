/**
 * Filter Store
 * Manages filters for entries, reports, and other data views
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Date range interface
 */
export interface DateRange {
    start: Date | null;
    end: Date | null;
    preset?: '7d' | '30d' | '90d' | 'MTD' | 'QTD' | 'YTD' | 'custom';
}

/**
 * Report filters interface
 */
export interface ReportFilters {
    dateRange: DateRange;
    groupBy: 'day' | 'week' | 'month';
    includeArchived: boolean;
    chartType?: 'bar' | 'pie' | 'table';
}

/**
 * Filter state interface
 */
interface FilterState {
    // Report filters
    reportFilters: ReportFilters;

    // Actions
    setReportFilters: (filters: Partial<ReportFilters>) => void;
    resetReportFilters: () => void;
}

/**
 * Get default date range for "30d" preset
 */
const getDefault30DayRange = (): DateRange => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    return {
        start,
        end,
        preset: '30d',
    };
};

/**
 * Initial filter state
 */
const initialState: Omit<FilterState, 'setReportFilters' | 'resetReportFilters'> = {
    reportFilters: {
        dateRange: getDefault30DayRange(),
        groupBy: 'day',
        includeArchived: false,
        chartType: 'bar',
    },
};

/**
 * Filter store
 */
export const useFilterStore = create<FilterState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,

                // Report filter actions
                setReportFilters: (filters: Partial<ReportFilters>) => {
                    set((state) => ({
                        reportFilters: { ...state.reportFilters, ...filters },
                    }));
                },

                resetReportFilters: () => {
                    set({ reportFilters: initialState.reportFilters });
                },
            }),
            {
                name: 'filter-storage',
                partialize: (state) => ({
                    reportFilters: state.reportFilters,
                }),
            }
        ),
        {
            name: 'filter-store',
        }
    )
);

