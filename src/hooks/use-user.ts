/**
 * useUser Hook
 * Provides user data and management methods
 */

'use client';

import { useAuth } from './use-auth';
import { UserService } from '@/services';
import { useAuthStore } from '@/stores/auth.store';
import { useCallback, useEffect } from 'react';

export function useUser() {
    const { user: authUser, isAuthenticated } = useAuth();
    const { user, preferences, loading, error } = useAuthStore();

    /**
     * Update user profile
     */
    const updateProfile = useCallback(
        async (data: { displayName?: string; photoURL?: string }) => {
            if (!authUser?.uid) throw new Error('User not authenticated');
            return UserService.updateUser(authUser.uid, data);
        },
        [authUser?.uid]
    );

    /**
     * Update user preferences
     */
    const updatePreferences = useCallback(
        async (data: any) => {
            if (!authUser?.uid) throw new Error('User not authenticated');
            const updatedPrefs = await UserService.updateUserPreferences(authUser.uid, data);
            useAuthStore.getState().setPreferences(updatedPrefs);
            return updatedPrefs;
        },
        [authUser?.uid]
    );

    /**
     * Refresh user data
     */
    const refreshUserData = useCallback(async () => {
        if (!authUser?.uid) return;
        const userData = await UserService.getUserProfile(authUser.uid);
        if (userData) {
            useAuthStore.getState().setUser(userData);
        }
        const prefs = await UserService.getUserPreferences(authUser.uid);
        if (prefs) {
            useAuthStore.getState().setPreferences(prefs);
        }
    }, [authUser?.uid]);

    return {
        // State
        user,
        preferences,
        isLoading: loading,
        error,
        isAuthenticated,

        // Actions
        updateProfile,
        updatePreferences,
        refreshUserData,
    };
}

export default useUser;

