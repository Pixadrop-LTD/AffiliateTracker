/**
 * useEntries Hook
 * Provides entries management methods
 */

'use client';

import { EntriesService } from '@/services';
import { useAuth } from './use-auth';
import { useEffect, useState } from 'react';
import type { EntryWithDerived } from '@/domain/models/entry';

export function useEntries() {
    const { isAuthenticated } = useAuth();
    const [entries, setEntries] = useState<EntryWithDerived[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Load user entries
     */
    const loadEntries = async (limit: number = 50) => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);
            const result = await EntriesService.getUserEntries(limit);
            setEntries(result.entries);
        } catch (err: any) {
            setError(err.message || 'Failed to load entries');
            console.error('Error loading entries:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load entries by date range
     */
    const loadEntriesByDateRange = async (startDate: Date, endDate: Date) => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);
            const result = await EntriesService.getEntriesByDateRange(startDate, endDate);
            setEntries(result);
        } catch (err: any) {
            setError(err.message || 'Failed to load entries');
            console.error('Error loading entries:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create entry
     */
    const createEntry = async (data: any) => {
        try {
            setLoading(true);
            setError(null);
            const entryId = await EntriesService.createEntry(data);
            await loadEntries();
            return entryId;
        } catch (err: any) {
            setError(err.message || 'Failed to create entry');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update entry
     */
    const updateEntry = async (entryId: string, data: any) => {
        try {
            setLoading(true);
            setError(null);
            await EntriesService.updateEntry(entryId, data);
            await loadEntries();
        } catch (err: any) {
            setError(err.message || 'Failed to update entry');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Delete entry
     */
    const deleteEntry = async (entryId: string) => {
        try {
            setLoading(true);
            setError(null);
            await EntriesService.deleteEntry(entryId);
            await loadEntries();
        } catch (err: any) {
            setError(err.message || 'Failed to delete entry');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Auto-load entries when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadEntries();
        }
    }, [isAuthenticated]);

    return {
        // State
        entries,
        loading,
        error,

        // Actions
        loadEntries,
        loadEntriesByDateRange,
        createEntry,
        updateEntry,
        deleteEntry,
        refreshEntries: loadEntries,
    };
}

export default useEntries;

