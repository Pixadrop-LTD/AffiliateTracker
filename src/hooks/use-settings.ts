/**
 * Settings Hook
 * Provides easy access to user preferences and update functions
 */

import { type UpdateUserPreferencesDto } from '@/domain/dto/user.dto';
import { type UserPrefsDoc } from '@/domain/models/user';
import { useAuth } from '@/hooks/use-auth';
import { SettingsService } from '@/services/settings';
import { useCallback, useEffect, useState } from 'react';

export interface UseSettingsReturn {
    // Current preferences
    preferences: UserPrefsDoc | null;

    // Loading state
    isLoading: boolean;

    // Update functions
    updateSetting: <K extends keyof UpdateUserPreferencesDto>(
        key: K,
        value: UpdateUserPreferencesDto[K],
        options?: { immediate?: boolean }
    ) => Promise<void>;

    updatePreferences: (
        updates: Partial<UpdateUserPreferencesDto>,
        options?: { immediate?: boolean }
    ) => Promise<void>;

    // Utility functions
    resetToDefaults: () => Promise<void>;
    forceSave: () => Promise<void>;
    refreshPreferences: () => Promise<void>;

    // Getters for specific settings
    getCurrentTheme: () => 'light' | 'dark' | 'system';
    getCurrentCurrency: () => string;
    getCurrentDateFormat: () => string;
    getCurrentTimeFormat: () => string;
    isNotificationEnabled: (type: keyof NonNullable<UserPrefsDoc['notifications']>) => boolean;
}

/**
 * @Description Hook for managing user settings with auto-save functionality
 * @Return {UseSettingsReturn} Settings state and methods
 */
export const useSettings = (): UseSettingsReturn => {
    const { user, isAuthenticated } = useAuth();
    const [preferences, setPreferences] = useState<UserPrefsDoc | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load preferences when user changes
    useEffect(() => {
        const loadPreferences = async () => {
            if (!isAuthenticated || !user?.uid) {
                setPreferences(null);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const prefs = await SettingsService.getUserPreferences(user.uid);
                setPreferences(prefs);
            } catch (error) {
                console.error('Failed to load preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();
    }, [user?.uid, isAuthenticated]);

    // Refresh preferences
    const refreshPreferences = useCallback(async () => {
        if (!user?.uid) return;

        try {
            const prefs = await SettingsService.getUserPreferences(user.uid);
            setPreferences(prefs);
        } catch (error) {
            console.error('Failed to refresh preferences:', error);
        }
    }, [user?.uid]);

    // Update a single setting
    const updateSetting = useCallback(
        async <K extends keyof UpdateUserPreferencesDto>(
            key: K,
            value: UpdateUserPreferencesDto[K],
            options: { immediate?: boolean } = {}
        ) => {
            if (!user?.uid) {
                throw new Error('User not authenticated');
            }

            // Optimistically update local state
            if (preferences) {
                setPreferences({
                    ...preferences,
                    [key]: value,
                    updatedAt: null as any, // Will be set by service
                });
            }

            await SettingsService.updateUserPreferences(user.uid, { [key]: value } as any, options);
            await refreshPreferences();
        },
        [user?.uid, preferences, refreshPreferences]
    );

    // Update multiple preferences
    const updatePreferences = useCallback(
        async (updates: Partial<UpdateUserPreferencesDto>, options: { immediate?: boolean } = {}) => {
            if (!user?.uid) {
                throw new Error('User not authenticated');
            }

            // Optimistically update local state
            if (preferences) {
                setPreferences({
                    ...preferences,
                    ...updates,
                    updatedAt: null as any,
                });
            }

            await SettingsService.updateUserPreferences(user.uid, updates, options);
            await refreshPreferences();
        },
        [user?.uid, preferences, refreshPreferences]
    );

    // Reset to defaults
    const resetToDefaults = useCallback(async () => {
        if (!user?.uid) {
            throw new Error('User not authenticated');
        }

        await SettingsService.updateUserPreferences(
            user.uid,
            {
                theme: 'system',
                dateFormat: 'MMM d, yyyy',
                timeFormat: 'HH:mm',
                currency: 'USD',
                dateRange: '30d',
                chartType: 'line',
                visibleKpiCards: ['spend', 'earnings', 'profit', 'roi'],
                notifications: {
                    email: true,
                    push: true,
                    weeklyReport: true,
                    monthlyReport: true,
                },
            },
            { immediate: true }
        );
        await refreshPreferences();
    }, [user?.uid, refreshPreferences]);

    // Force save
    const forceSave = useCallback(async () => {
        if (!user?.uid) {
            throw new Error('User not authenticated');
        }

        await SettingsService.forceSave(user.uid);
    }, [user?.uid]);

    // Getters
    const getCurrentTheme = useCallback(
        () => preferences?.theme || 'system',
        [preferences?.theme]
    );

    const getCurrentCurrency = useCallback(
        () => preferences?.currency || 'USD',
        [preferences?.currency]
    );

    const getCurrentDateFormat = useCallback(
        () => preferences?.dateFormat || 'MMM d, yyyy',
        [preferences?.dateFormat]
    );

    const getCurrentTimeFormat = useCallback(
        () => preferences?.timeFormat || 'HH:mm',
        [preferences?.timeFormat]
    );

    const isNotificationEnabled = useCallback(
        (type: keyof NonNullable<UserPrefsDoc['notifications']>) => {
            return (preferences?.notifications as any)?.[type] ?? true;
        },
        [preferences?.notifications]
    );

    return {
        // State
        preferences,
        isLoading,

        // Update functions
        updateSetting,
        updatePreferences,

        // Utility functions
        resetToDefaults,
        forceSave,
        refreshPreferences,

        // Getters
        getCurrentTheme,
        getCurrentCurrency,
        getCurrentDateFormat,
        getCurrentTimeFormat,
        isNotificationEnabled,
    };
};

