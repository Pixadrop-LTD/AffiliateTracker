/**
 * AuthProvider
 * Manages Firebase authentication state and provides auth methods
 */

"use client";

import { getAuthInstance } from "@/lib/firebase";
import { UserService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import {
    EmailAuthProvider,
    FacebookAuthProvider,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    updatePassword,
} from "firebase/auth";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Authentication provider component
 * Manages auth state synchronization with Firebase and Zustand store
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const { setUser, setLoading, setError, setIsInitializing, setPreferences } = useAuthStore();

    useEffect(() => {
        const auth = getAuthInstance();
        let unsubscribe: (() => void) | undefined;

        const setupAuthListener = async () => {
            try {
                unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    try {
                        if (firebaseUser) {
                            console.log("Auth state changed: User logged in", firebaseUser.uid);
                            // Fetch user document from Firestore
                            const userDoc = await UserService.getUserProfile(firebaseUser.uid);

                            if (userDoc) {
                                console.log("User document found, setting user state");
                                setUser(userDoc);

                                // Load user preferences
                                const userPrefs = await UserService.getUserPreferences(firebaseUser.uid);
                                setPreferences(userPrefs);
                            } else {
                                console.warn("No user document found for uid:", firebaseUser.uid);
                            }
                        } else {
                            console.log("Auth state changed: User logged out");
                            setUser(null);
                            setPreferences(null);
                        }
                    } catch (error) {
                        console.error("Error loading user data:", error);
                        setError("Failed to load user data");
                    } finally {
                        setIsInitializing(false);
                    }
                });
            } catch (error) {
                console.error("Error setting up auth listener:", error);
                setError("Authentication error");
                setIsInitializing(false);
            }
        };

        setupAuthListener();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [setUser, setError, setIsInitializing, setPreferences]);

    return <>{children}</>;
}

/**
 * Authentication hook
 * Provides authentication methods and state
 */
export function useAuth() {
    const { user, loading, error, isAuthenticated, isAdmin } = useAuthStore();
    const auth = getAuthInstance();
    const googleProvider = new GoogleAuthProvider();
    const facebookProvider = new FacebookAuthProvider();

    const signIn = async (email: string, password: string): Promise<void> => {
        try {
            useAuthStore.getState().setLoading(true);
            useAuthStore.getState().setError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            useAuthStore.getState().setError(err.message || "Failed to sign in");
            throw err;
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
        try {
            useAuthStore.getState().setLoading(true);
            useAuthStore.getState().setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { user: firebaseUser } = userCredential;

            // Create user document
            const createUserData: any = {
                email: firebaseUser.email!,
            };
            if (displayName || firebaseUser.displayName) {
                createUserData.displayName = displayName || firebaseUser.displayName;
            }
            if (firebaseUser.photoURL) {
                createUserData.photoURL = firebaseUser.photoURL;
            }
            await UserService.createUser(firebaseUser.uid, createUserData);
        } catch (err: any) {
            useAuthStore.getState().setError(err.message || "Failed to sign up");
            throw err;
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    };

    const signOut = async (): Promise<void> => {
        try {
            useAuthStore.getState().setLoading(true);
            await firebaseSignOut(auth);
            useAuthStore.getState().logout();
        } catch (err: any) {
            useAuthStore.getState().setError(err.message || "Failed to sign out");
            throw err;
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    };

    const signInWithGoogle = async (): Promise<void> => {
        try {
            useAuthStore.getState().setLoading(true);
            useAuthStore.getState().setError(null);
            const userCredential = await signInWithPopup(auth, googleProvider);
            const { user: firebaseUser } = userCredential;

            // Check if user document exists, create if not
            const userDoc = await UserService.getUserProfile(firebaseUser.uid);
            if (!userDoc) {
                const createUserData: any = {
                    email: firebaseUser.email!,
                };
                if (firebaseUser.displayName) {
                    createUserData.displayName = firebaseUser.displayName;
                }
                if (firebaseUser.photoURL) {
                    createUserData.photoURL = firebaseUser.photoURL;
                }
                await UserService.createUser(firebaseUser.uid, createUserData);
            }
        } catch (err: any) {
            useAuthStore.getState().setError(err.message || "Failed to sign in with Google");
            throw err;
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    };

    const resetPassword = async (email: string): Promise<void> => {
        try {
            useAuthStore.getState().setLoading(true);
            useAuthStore.getState().setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err: any) {
            useAuthStore.getState().setError(err.message || "Failed to send password reset email");
            throw err;
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    };

    const clearError = () => {
        useAuthStore.getState().clearError();
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        try {
            useAuthStore.getState().setLoading(true);
            useAuthStore.getState().setError(null);

            const currentUser = auth.currentUser;
            if (!currentUser || !currentUser.email) {
                throw new Error("No authenticated user");
            }

            // Re-authenticate with current password
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // Update password
            await updatePassword(currentUser, newPassword);
        } catch (err: any) {
            useAuthStore.getState().setError(err.message || "Failed to change password");
            throw err;
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    };

    const signInWithFacebook = async (): Promise<void> => {
        try {
            useAuthStore.getState().setLoading(true);
            useAuthStore.getState().setError(null);
            const userCredential = await signInWithPopup(auth, facebookProvider);
            const { user: firebaseUser } = userCredential;

            // Check if user document exists, create if not
            const userDoc = await UserService.getUserProfile(firebaseUser.uid);
            if (!userDoc) {
                const createUserData: any = {
                    email: firebaseUser.email!,
                };
                if (firebaseUser.displayName) {
                    createUserData.displayName = firebaseUser.displayName;
                }
                if (firebaseUser.photoURL) {
                    createUserData.photoURL = firebaseUser.photoURL;
                }
                await UserService.createUser(firebaseUser.uid, createUserData);
            }
        } catch (err: any) {
            useAuthStore.getState().setError(err.message || "Failed to sign in with Facebook");
            throw err;
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    };

    const { isInitializing } = useAuthStore();

    return {
        user,
        loading,
        isInitializing,
        error,
        isAuthenticated,
        isAdmin,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithFacebook,
        resetPassword,
        changePassword,
        clearError,
    };
}
