/**
 * Entries Service
 * Handles all entry-related database operations
 */

import type { CreateEntryDto, UpdateEntryDto } from '@/domain/dto/entry.dto';
import type { EntryWithDerived } from '@/domain/models/entry';
import { EntryDoc, calculateEntryDerived } from '@/domain/models/entry';
import { getAuthInstance, getDb } from '@/lib/firebase';
import type { DocumentSnapshot } from 'firebase/firestore';
import {
    Timestamp,
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    updateDoc,
    where
} from 'firebase/firestore';

/**
 * Entries service class for managing entry operations
 */
export class EntriesService {
    private static readonly ENTRIES_COLLECTION = 'entries';

    /**
     * Get Firestore database instance
     */
    private static async getDb() {
        return getDb();
    }

    /**
     * Get current authenticated user ID
     * @throws Error if no user is authenticated
     */
    private static getCurrentUid(): string {
        // Only try to get auth in browser environment
        if (typeof window === 'undefined') {
            throw new Error('Cannot access auth on server side');
        }

        const auth = getAuthInstance();
        const uid = auth.currentUser?.uid;
        if (!uid) {
            throw new Error('User not authenticated. Please sign in to continue.');
        }
        return uid;
    }

    /**
     * Create a new entry
     */
    static async createEntry(input: CreateEntryDto): Promise<string> {
        try {
            const db = await this.getDb();
            const uid = input.uid || this.getCurrentUid();
            const now = Timestamp.now();

            const entryData: Omit<EntryDoc, 'id'> = {
                uid,
                date: input.date instanceof Date ? Timestamp.fromDate(input.date) : (input.date),
                spend: input.spend || 0,
                revenue: input.revenue,
                profit: input.revenue && input.spend ? input.revenue - input.spend : undefined,
                adSpend: input.adSpend,
                adSpendDetails: input.adSpendDetails,
                revenueSources: input.revenueSources,
                currency: input.currency || 'USD',
                notes: input.notes,
                status: input.status || 'active',
                createdAt: now,
                updatedAt: now,
            };

            const docRef = await addDoc(collection(db, this.ENTRIES_COLLECTION), entryData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating entry:', error);
            throw new Error('Failed to create entry');
        }
    }

    /**
     * Get entry by ID
     */
    static async getEntry(entryId: string): Promise<EntryWithDerived | null> {
        try {
            const db = await this.getDb();
            const entryDoc = await getDoc(doc(db, this.ENTRIES_COLLECTION, entryId));

            if (!entryDoc.exists()) return null;

            const entryData = entryDoc.data() as EntryDoc;
            return calculateEntryDerived(entryData);
        } catch (error) {
            console.error('Error getting entry:', error);
            throw new Error('Failed to get entry');
        }
    }

    /**
     * Update an entry
     */
    static async updateEntry(entryId: string, input: UpdateEntryDto): Promise<void> {
        try {
            const db = await this.getDb();
            const entryRef = doc(db, this.ENTRIES_COLLECTION, entryId);

            const updateData: Partial<EntryDoc> = {
                updatedAt: Timestamp.now(),
            };

            if (input.date !== undefined) {
                updateData.date = input.date instanceof Date ? Timestamp.fromDate(input.date) : input.date as Timestamp;
            }
            if (input.spend !== undefined) updateData.spend = input.spend;
            if (input.revenue !== undefined) {
                updateData.revenue = input.revenue;
                updateData.profit = input.revenue - (input.spend ?? (await this.getEntry(entryId))?.spend ?? 0);
            }
            if (input.adSpend !== undefined) updateData.adSpend = input.adSpend;
            if (input.adSpendDetails !== undefined) updateData.adSpendDetails = input.adSpendDetails;
            if (input.revenueSources !== undefined) updateData.revenueSources = input.revenueSources;
            if (input.currency !== undefined) updateData.currency = input.currency;
            if (input.notes !== undefined) updateData.notes = input.notes;
            if (input.status !== undefined) updateData.status = input.status;

            await updateDoc(entryRef, updateData);
        } catch (error) {
            console.error('Error updating entry:', error);
            throw new Error('Failed to update entry');
        }
    }

    /**
     * Delete an entry
     */
    static async deleteEntry(entryId: string): Promise<void> {
        try {
            const db = await this.getDb();
            await deleteDoc(doc(db, this.ENTRIES_COLLECTION, entryId));
        } catch (error) {
            console.error('Error deleting entry:', error);
            throw new Error('Failed to delete entry');
        }
    }

    /**
     * Get entries for current user
     */
    static async getUserEntries(
        limitCount: number = 50,
        startAfterDoc?: DocumentSnapshot,
        uid?: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<{ entries: EntryWithDerived[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
        try {
            const db = await this.getDb();
            // Use provided uid or get from auth
            const userId = uid || this.getCurrentUid();

            let q = query(
                collection(db, this.ENTRIES_COLLECTION),
                where('uid', '==', userId)
            );

            // Add date range filters if provided
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                q = query(q, where('date', '>=', Timestamp.fromDate(start)));
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                q = query(q, where('date', '<=', Timestamp.fromDate(end)));
            }

            // Add ordering and pagination
            q = query(q, orderBy('date', 'desc'));
            if (startAfterDoc) {
                q = query(q, startAfter(startAfterDoc));
            }
            q = query(q, limit(limitCount));

            const querySnapshot = await getDocs(q);
            const entries: EntryWithDerived[] = [];

            querySnapshot.forEach((doc) => {
                const entryData = doc.data() as EntryDoc;
                // Include the document ID
                const entryWithId = { ...entryData, id: doc.id };
                entries.push(calculateEntryDerived(entryWithId));
            });

            return {
                entries,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
                hasMore: querySnapshot.docs.length === limitCount,
            };
        } catch (error) {
            console.error('Error getting user entries:', error);
            throw new Error('Failed to get entries');
        }
    }

    /**
     * Get entries by date range
     */
    static async getEntriesByDateRange(startDate: Date, endDate: Date, uid?: string): Promise<EntryWithDerived[]> {
        try {
            const db = await this.getDb();
            const userId = uid || this.getCurrentUid();

            const q = query(
                collection(db, this.ENTRIES_COLLECTION),
                where('uid', '==', userId),
                where('date', '>=', Timestamp.fromDate(startDate)),
                where('date', '<=', Timestamp.fromDate(endDate)),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const entries: EntryWithDerived[] = [];

            querySnapshot.forEach((doc) => {
                const entryData = doc.data() as EntryDoc;
                // Include the document ID
                const entryWithId = { ...entryData, id: doc.id };
                entries.push(calculateEntryDerived(entryWithId));
            });

            return entries;
        } catch (error) {
            console.error('Error getting entries by date range:', error);
            throw new Error('Failed to get entries');
        }
    }

    /**
     * Get dashboard data aggregated for a date range
     */
    static async getDashboardData(startDate: Date, endDate: Date, uid?: string): Promise<{
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
    }> {
        try {
            const db = await this.getDb();
            const userId = uid || this.getCurrentUid();

            // Normalize dates to start and end of day
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const q = query(
                collection(db, this.ENTRIES_COLLECTION),
                where('uid', '==', userId),
                where('date', '>=', Timestamp.fromDate(start)),
                where('date', '<=', Timestamp.fromDate(end)),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);

            let totalSpend = 0;
            let totalRevenue = 0;
            const dailyMap = new Map<string, { spend: number; revenue: number }>();

            querySnapshot.forEach((doc) => {
                const data = doc.data() as EntryDoc;
                totalSpend += data.spend;
                const baseRev = data.revenue ?? data.earnings ?? 0;
                totalRevenue += baseRev;

                // Group by date for daily data
                const dateKey = data.date.toDate().toISOString().split('T')[0];
                const existingDay = dailyMap.get(dateKey) || { spend: 0, revenue: 0 };
                dailyMap.set(dateKey, {
                    spend: existingDay.spend + data.spend,
                    revenue: existingDay.revenue + baseRev,
                });
            });

            const totalProfit = totalRevenue - totalSpend;
            const avgROI = totalSpend > 0 ? (totalProfit / totalSpend) * 100 : 0;

            const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
                date,
                spend: data.spend,
                earnings: data.revenue, // keep legacy key name for UI compatibility
                profit: data.revenue - data.spend,
            }));

            return {
                totalSpend,
                totalEarnings: totalRevenue, // keep legacy key name for UI compatibility
                totalProfit,
                avgROI,
                entriesCount: querySnapshot.docs.length,
                dailyData,
            };
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            throw new Error('Failed to get dashboard data');
        }
    }
}

