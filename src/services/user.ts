/**
 * User Service
 * Handles all user-related database operations
 */

import {
    type CreateUserDto,
    type UpdateUserDto,
    type UpdateUserPreferencesDto,
    type UserFiltersDto,
    type UserSortOptionsDto,
} from '@/domain/dto/user.dto';
import {
    type UserDoc,
    type UserPrefsDoc,
    type UserProfile,
    type UserRole,
    createUserProfile,
    getDefaultUserPrefs,
} from '@/domain/models/user';
import { getDb } from '@/lib/firebase';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import {
    Timestamp,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    setDoc,
    startAfter,
    updateDoc,
    where,
} from 'firebase/firestore';

/**
 * User service class for managing user operations
 */
export class UserService {
    private static readonly USERS_COLLECTION = 'users';
    private static readonly USER_PREFS_COLLECTION = 'user_prefs';

    /**
     * Get Firestore database instance
     */
    private static async getDb() {
        return getDb();
    }

    /**
     * Create a new user
     */
    static async createUser(uid: string, data: CreateUserDto): Promise<UserProfile> {
        const db = await this.getDb();
        const userRef = doc(db, this.USERS_COLLECTION, uid);
        const userData: Omit<UserDoc, 'uid'> = {
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            role: data.role || 'user',
            defaultCurrency: data.defaultCurrency,
            timezone: data.timezone,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        await setDoc(userRef, userData);

        // Transform the default prefs to match the DTO structure
        const defaultPrefs = getDefaultUserPrefs(uid);
        const prefsForUpdate: UpdateUserPreferencesDto = {
            theme: defaultPrefs.theme,
            dateFormat: 'MMM d, yyyy',
            timeFormat: 'HH:mm',
            currency: 'USD',
            dateRange: (defaultPrefs.defaultDateRange?.toLowerCase() as '7d' | '30d' | 'mtd' | 'qtd' | 'ytd' | 'custom') || '30d',
            chartType: defaultPrefs.dashboard?.chartType || 'line',
            visibleKpiCards: defaultPrefs.dashboard?.kpiCards || ['spend', 'earnings', 'profit', 'roi'],
            notifications: {
                email: defaultPrefs.notifications?.emailEnabled ?? true,
                push: defaultPrefs.notifications?.pushEnabled ?? true,
                weeklyReport: defaultPrefs.notifications?.weeklySummary ?? true,
                monthlyReport: true,
            },
        };

        await this.updateUserPreferences(uid, prefsForUpdate);

        const userProfile = await this.getUserProfile(uid);
        if (!userProfile) {
            throw new Error('Failed to retrieve user profile after creation');
        }
        return userProfile;
    }

    /**
     * Get user profile by ID
     */
    static async getUserProfile(uid: string): Promise<UserProfile | null> {
        const db = await this.getDb();
        const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, uid));
        if (!userDoc.exists()) return null;

        const userData = userDoc.data() as UserDoc;
        return createUserProfile(userData);
    }

    /**
     * Update user profile
     */
    static async updateUser(uid: string, data: UpdateUserDto): Promise<UserProfile> {
        const db = await this.getDb();
        const userRef = doc(db, this.USERS_COLLECTION, uid);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now(),
        };

        await updateDoc(userRef, updateData);
        const updated = await this.getUserProfile(uid);
        if (!updated) {
            throw new Error('Failed to retrieve updated user profile');
        }
        return updated;
    }

    /**
     * Get user preferences
     */
    static async getUserPreferences(uid: string): Promise<UserPrefsDoc> {
        const db = await this.getDb();
        const prefsDoc = await getDoc(doc(db, this.USER_PREFS_COLLECTION, uid));

        if (!prefsDoc.exists()) {
            // Create default preferences if they don't exist
            const defaultPrefs = getDefaultUserPrefs(uid);
            const prefsData = {
                ...defaultPrefs,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };
            await setDoc(doc(db, this.USER_PREFS_COLLECTION, uid), prefsData);
            return prefsData as UserPrefsDoc;
        }

        return prefsDoc.data() as UserPrefsDoc;
    }

    /**
     * Update user preferences
     */
    static async updateUserPreferences(uid: string, data: UpdateUserPreferencesDto): Promise<UserPrefsDoc> {
        const db = await this.getDb();
        const prefsRef = doc(db, this.USER_PREFS_COLLECTION, uid);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now(),
        };

        await setDoc(prefsRef, updateData, { merge: true });
        return this.getUserPreferences(uid);
    }

    /**
     * List users with pagination and filtering (admin only)
     */
    static async listUsers(
        filters: UserFiltersDto = {},
        sort?: UserSortOptionsDto,
        limitCount: number = 10,
        startAfterDoc?: QueryDocumentSnapshot
    ) {
        const db = await this.getDb();
        let q = query(collection(db, this.USERS_COLLECTION));

        // Apply filters
        if (filters.role && filters.role.length > 0) {
            q = query(q, where('role', 'in', filters.role));
        }

        // Apply pagination
        if (startAfterDoc) {
            q = query(q, startAfter(startAfterDoc), limit(limitCount));
        } else {
            q = query(q, limit(limitCount));
        }

        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];

        querySnapshot.forEach((doc) => {
            users.push(createUserProfile(doc.data() as UserDoc));
        });

        return {
            users,
            lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
            hasMore: !querySnapshot.empty && querySnapshot.docs.length === limitCount,
        };
    }

    /**
     * Check if user has specific role
     */
    static async hasRole(uid: string, role: UserRole): Promise<boolean> {
        const user = await this.getUserProfile(uid);
        return user?.role === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    static async hasAnyRole(uid: string, roles: UserRole[]): Promise<boolean> {
        const user = await this.getUserProfile(uid);
        return user ? roles.includes(user.role) : false;
    }

    /**
     * Delete user account (admin only)
     */
    static async deleteUser(uid: string): Promise<void> {
        const db = await this.getDb();
        // Note: This only deletes the user document, not the auth record
        // You'll need to handle auth deletion separately using Firebase Admin SDK
        await deleteDoc(doc(db, this.USERS_COLLECTION, uid));
    }
}

