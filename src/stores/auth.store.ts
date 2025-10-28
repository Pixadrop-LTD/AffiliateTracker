/**
 * Authentication Store
 * Manages authentication state using Zustand with persistence
 */

import type { UserPrefsDoc, UserProfile } from '@/domain/models/user';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Authentication state interface
 */
interface AuthState {
    // State
    user: UserProfile | null;
    preferences: UserPrefsDoc | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isInitializing: boolean;

    // Actions
    setUser: (user: UserProfile | null) => void;
    setPreferences: (preferences: UserPrefsDoc | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setIsInitializing: (isInitializing: boolean) => void;
    logout: () => void;
    clearError: () => void;
}

/**
 * Authentication store with Zustand
 * Includes persistence and devtools support
 */
export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                // Initial state
                user: null,
                preferences: null,
                loading: false,
                error: null,
                isAuthenticated: false,
                isAdmin: false,
                isInitializing: true,

                // Actions
                setUser: (user) =>
                    set(
                        (state) => ({
                            ...state,
                            user,
                            isAuthenticated: !!user,
                            isAdmin: user?.role === 'admin',
                        }),
                        false,
                        'auth/setUser'
                    ),

                setPreferences: (preferences) =>
                    set(
                        (state) => ({
                            ...state,
                            preferences,
                        }),
                        false,
                        'auth/setPreferences'
                    ),

                setLoading: (loading) =>
                    set(
                        (state) => ({
                            ...state,
                            loading,
                        }),
                        false,
                        'auth/setLoading'
                    ),

                setIsInitializing: (isInitializing) =>
                    set(
                        (state) => ({
                            ...state,
                            isInitializing,
                        }),
                        false,
                        'auth/setIsInitializing'
                    ),

                setError: (error) =>
                    set(
                        (state) => ({
                            ...state,
                            error,
                        }),
                        false,
                        'auth/setError'
                    ),

                logout: () =>
                    set(
                        () => ({
                            user: null,
                            preferences: null,
                            loading: false,
                            error: null,
                            isAuthenticated: false,
                            isAdmin: false,
                            isInitializing: false,
                        }),
                        false,
                        'auth/logout'
                    ),

                clearError: () =>
                    set(
                        (state) => ({
                            ...state,
                            error: null,
                        }),
                        false,
                        'auth/clearError'
                    ),
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    user: state.user,
                    preferences: state.preferences,
                    isAuthenticated: state.isAuthenticated,
                    isAdmin: state.isAdmin,
                    isInitializing: false, // Don't persist init state
                }),
            }
        ),
        {
            name: 'auth-store',
        }
    )
);

