/**
 * Settings Service
 * Handles user preferences management with debouncing and auto-save
 */

import { type UpdateUserPreferencesDto } from '@/domain/dto/user.dto';
import { type UserPrefsDoc } from '@/domain/models/user';
import { getDb } from '@/lib/firebase';
import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';

export class SettingsService {
    private static readonly USER_PREFS_COLLECTION = 'user_prefs';
    private static autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();
    private static readonly AUTO_SAVE_DELAY = 2000; // 2 seconds debounce

    /**
     * @Description Get user preferences
     * @Params {string} uid - User ID
     * @Return {Promise<UserPrefsDoc>} User preferences
     */
    static async getUserPreferences(uid: string): Promise<UserPrefsDoc | null> {
        try {
            const db = getDb();
            const prefsDoc = await getDoc(doc(db, this.USER_PREFS_COLLECTION, uid));

            if (!prefsDoc.exists()) {
                return null;
            }

            return prefsDoc.data() as UserPrefsDoc;
        } catch (error) {
            console.error('Failed to get user preferences:', error);
            throw error;
        }
    }

    /**
     * @Description Update user preferences with optional immediate save
     * @Params {string} uid - User ID
     * @Params {Partial<UpdateUserPreferencesDto>} updates - Preference updates
     * @Params {{ immediate?: boolean }} [options] - Save options
     * @Return {Promise<void>}
     */
    static async updateUserPreferences(
        uid: string,
        updates: Partial<UpdateUserPreferencesDto>,
        options: { immediate?: boolean } = {}
    ): Promise<void> {
        try {
            if (options.immediate) {
                await this.savePreferences(uid, updates);
            } else {
                // Debounced auto-save
                this.scheduleAutoSave(uid, updates);
            }
        } catch (error) {
            console.error('Failed to update preferences:', error);
            throw error;
        }
    }

    /**
     * @Description Deep merge objects for nested updates
     * @Params {any} target - Target object
     * @Params {any} source - Source object
     * @Return {any} Merged object
     */
    private static deepMerge(target: any, source: any): any {
        const output = { ...target };

        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach((key) => {
                if (isObject(source[key]) && !Array.isArray(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else if (Array.isArray(source[key])) {
                    output[key] = source[key];
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }

        return output;
    }

    /**
     * @Description Save preferences to Firestore
     * @Params {string} uid - User ID
     * @Params {Partial<UpdateUserPreferencesDto>} updates - Updates to save
     * @Return {Promise<void>}
     */
    private static async savePreferences(uid: string, updates: Partial<UpdateUserPreferencesDto>): Promise<void> {
        const db = getDb();
        const prefsRef = doc(db, this.USER_PREFS_COLLECTION, uid);

        // Get current preferences
        const currentDoc = await getDoc(prefsRef);
        const currentPrefs = currentDoc.exists() ? (currentDoc.data() as UserPrefsDoc) : null;

        // Deep merge with existing preferences
        const mergedPrefs = currentPrefs
            ? this.deepMerge(currentPrefs, updates)
            : updates;

        // Update timestamp
        const updateData = {
            ...mergedPrefs,
            uid,
            updatedAt: Timestamp.now(),
        };

        // Create document with createdAt if it doesn't exist
        if (!currentDoc.exists()) {
            updateData.createdAt = Timestamp.now();
        }

        await setDoc(prefsRef, updateData, { merge: true });
    }

    /**
     * @Description Schedule auto-save with debouncing
     * @Params {string} uid - User ID
     * @Params {Partial<UpdateUserPreferencesDto>} updates - Updates to save
     * @Return {void}
     */
    private static scheduleAutoSave(uid: string, updates: Partial<UpdateUserPreferencesDto>): void {
        // Clear existing timer
        const existingTimer = this.autoSaveTimers.get(uid);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Schedule new save
        const timer = setTimeout(async () => {
            try {
                await this.savePreferences(uid, updates);
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                this.autoSaveTimers.delete(uid);
            }
        }, this.AUTO_SAVE_DELAY);

        this.autoSaveTimers.set(uid, timer);
    }

    /**
     * @Description Force save any pending updates
     * @Params {string} uid - User ID
     * @Return {Promise<void>}
     */
    static async forceSave(uid: string): Promise<void> {
        const timer = this.autoSaveTimers.get(uid);
        if (timer) {
            clearTimeout(timer);
            this.autoSaveTimers.delete(uid);
        }
    }
}

/**
 * @Description Check if value is an object
 * @Params {any} item - Value to check
 * @Return {boolean} True if object
 */
function isObject(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
}

