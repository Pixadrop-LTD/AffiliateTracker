/**
 * Reports Utilities
 * Helper functions for processing and formatting report data
 */

import type { EntryWithDerived } from '@/domain/models/entry';
import { effectiveRevenue } from '@/domain/models/entry';
import { format } from 'date-fns';

export interface ChartData {
    x: string;
    y: number;
    spend: number;
    earnings: number;
    count: number;
    profit: number;
    roi: number;
    t: number; // timestamp for sorting
}

export interface ReportTotals {
    spend: number;
    earnings: number;
    count: number;
}

/**
 * Process entries into chart data grouped by time period
 */
export const processChartData = (
    entries: EntryWithDerived[],
    groupBy: 'day' | 'week' | 'month'
): ChartData[] => {
    const groups: Record<
        string,
        { spend: number; earnings: number; count: number; t: number }
    > = {};

    entries.forEach((entry) => {
        let date: Date;
        const entryDate = entry.date;

        // Check if it has toDate method (Timestamp)
        if (entryDate && typeof entryDate === 'object' && 'toDate' in entryDate && typeof (entryDate as any).toDate === 'function') {
            date = (entryDate as any).toDate();
        } else if (entryDate instanceof Date) {
            date = entryDate;
        } else {
            date = new Date(entryDate as unknown as string | number);
        }
        let key = '';
        let t = 0;

        if (groupBy === 'day') {
            key = format(date, 'MMM d, yyyy');
            t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        } else if (groupBy === 'week') {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 6);
            key = `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
            t = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        } else {
            // month
            key = format(date, 'MMM yyyy');
            t = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        }

        if (!groups[key]) {
            groups[key] = { spend: 0, earnings: 0, count: 0, t };
        }

        const baseRevenue = effectiveRevenue(entry);
        groups[key].spend += entry.spend;
        groups[key].earnings += baseRevenue;
        groups[key].count += 1;
        groups[key].t = Math.min(groups[key].t, t || groups[key].t);
    });

    return Object.entries(groups)
        .map(([key, data]) => ({
            x: key,
            y: data.earnings - data.spend,
            spend: data.spend,
            earnings: data.earnings,
            count: data.count,
            profit: data.earnings - data.spend,
            roi: data.spend > 0 ? ((data.earnings - data.spend) / data.spend) * 100 : 0,
            t: data.t,
        }))
        .sort((a, b) => a.t - b.t); // Sort chronologically
};

/**
 * Calculate totals from entries
 */
export const calculateTotals = (entries: EntryWithDerived[]): ReportTotals => {
    return entries.reduce(
        (acc, entry) => {
            const rev = effectiveRevenue(entry);
            acc.spend += entry.spend;
            acc.earnings += rev;
            acc.count += 1;
            return acc;
        },
        { spend: 0, earnings: 0, count: 0 }
    );
};

/**
 * Get date range from time presets
 */
export const getDateRange = (
    timeRange: '7d' | '30d' | '90d' | 'mtd' | 'qtd' | 'ytd' | 'custom',
    customStart?: Date,
    customEnd?: Date
): { startDate: Date; endDate: Date } => {
    const now = new Date();
    let startDate = new Date(now);

    switch (timeRange) {
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case 'mtd':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'qtd': {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
            break;
        }
        case 'ytd':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case 'custom':
            startDate = customStart || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return { startDate, endDate: customEnd || now };
    }

    return { startDate, endDate: now };
};

/**
 * Filter entries by date range
 */
export const filterEntriesByDateRange = (
    entries: EntryWithDerived[],
    startDate: Date,
    endDate: Date
): EntryWithDerived[] => {
    return entries.filter((entry) => {
        const entryDate = entry.date;

        // Convert to Date if needed
        let date: Date;
        if (entryDate && typeof entryDate === 'object' && 'toDate' in entryDate && typeof (entryDate as any).toDate === 'function') {
            date = (entryDate as any).toDate();
        } else if (entryDate instanceof Date) {
            date = entryDate;
        } else {
            date = new Date(entryDate as unknown as string | number);
        }

        return date >= startDate && date <= endDate;
    });
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Get chart colors based on theme
 */
export const getChartColors = (): string[] => {
    return [
        'hsl(var(--primary-600))',
        'hsl(var(--secondary-500))',
        'hsl(var(--accent-500))',
        'hsl(var(--secondary-700))',
        'hsl(var(--orange-500))',
        'hsl(var(--destructive))',
        'hsl(var(--accent-600))',
        'hsl(var(--warning-500))',
    ];
};

/**
 * Get bar color based on value (green for profit, red for loss)
 */
export const getBarColor = (value: number): string => {
    return value >= 0 ? 'hsl(var(--secondary-600))' : 'hsl(var(--destructive))';
};

