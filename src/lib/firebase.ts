/**
 * Firebase initialization for Next.js web app
 * Optimized for server-side rendering and client-side hydration
 */

import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Firebase configuration interface
 */
export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}
/**
 * Your web app's Firebase configuration
 * Environment variables are prefixed with NEXT_PUBLIC_ for client-side access
 */
const firebaseConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

/**
 * Validate Firebase configuration
 */
const validateFirebaseConfig = (config: FirebaseConfig): void => {
    const requiredFields: (keyof FirebaseConfig)[] = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId',
    ];

    const missingFields = requiredFields.filter((field) => !config[field]);

    if (missingFields.length > 0) {
        throw new Error(
            `Missing required Firebase configuration: ${missingFields.join(', ')}`
        );
    }
};

// Validate configuration
validateFirebaseConfig(firebaseConfig);

/**
 * Initialize Firebase App (only once)
 * Uses getApps() to prevent duplicate initialization
 */
const getFirebaseApp = (): FirebaseApp => {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }
    return initializeApp(firebaseConfig);
};

/**
 * Initialize Firebase services
 * These are lazy-loaded to avoid SSR issues
 */
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;
let firebaseAnalytics: Analytics | null = null;

/**
 * Get Firebase App instance
 */
export const getApp = (): FirebaseApp => {
    if (!firebaseApp) {
        firebaseApp = getFirebaseApp();
    }
    return firebaseApp;
};

/**
 * Get Firebase Auth instance
 */
export const getAuthInstance = (): Auth => {
    if (!firebaseAuth) {
        firebaseAuth = getAuth(getApp());
    }
    return firebaseAuth;
};

/**
 * Get Firestore instance
 */
export const getDb = (): Firestore => {
    if (!firebaseDb) {
        firebaseDb = getFirestore(getApp());
    }
    return firebaseDb;
};

/**
 * Get Firebase Storage instance
 */
export const getStorageInstance = (): FirebaseStorage => {
    if (!firebaseStorage) {
        firebaseStorage = getStorage(getApp());
    }
    return firebaseStorage;
};

/**
 * Initialize Firebase Analytics (client-side only)
 * Returns null if analytics is not supported or unavailable
 */
export const getAnalyticsInstance = async (): Promise<Analytics | null> => {
    // Only run on client-side
    if (typeof window === 'undefined') {
        return null;
    }

    // Check if analytics is already initialized
    if (firebaseAnalytics) {
        return firebaseAnalytics;
    }

    // Check if analytics is supported
    const supported = await isSupported();

    if (supported) {
        try {
            const app = getApp();
            firebaseAnalytics = getAnalytics(app);
            return firebaseAnalytics;
        } catch (error) {
            console.error('Failed to initialize Firebase Analytics:', error);
            return null;
        }
    }

    return null;
};

/**
 * Firebase utilities for common operations
 */
export const firebaseUtils = {
    /**
     * Get current environment
     */
    getEnvironment: (): string => {
        return process.env.NODE_ENV || 'development';
    },

    /**
     * Check if running in production
     */
    isProduction: (): boolean => {
        return process.env.NODE_ENV === 'production';
    },

    /**
     * Check if running on client-side
     */
    isClient: (): boolean => {
        return typeof window !== 'undefined';
    },

    /**
     * Get Firebase app instance
     */
    getApp,

    /**
     * Get Auth instance
     */
    getAuth: getAuthInstance,

    /**
     * Get Firestore instance
     */
    getFirestore: getDb,

    /**
     * Get Storage instance
     */
    getStorage: getStorageInstance,
};

/**
 * Firebase error handling utilities
 */
export const firebaseErrors = {
    /**
     * Get user-friendly error message from Firebase error
     */
    getUserFriendlyMessage: (error: unknown): string => {
        if (!error || typeof error !== 'object') {
            return 'An unknown error occurred';
        }

        const firebaseError = error as { code?: string; message?: string };
        const errorCode = firebaseError.code || '';
        const errorMessage = firebaseError.message || firebaseError.code || '';

        // Common Firebase Auth errors
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please check your credentials and try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters long.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection and try again.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/user-disabled':
                return 'This account has been disabled. Please contact support.';
            case 'auth/operation-not-allowed':
                return 'This sign-in method is not enabled.';
            case 'auth/requires-recent-login':
                return 'Please sign in again to complete this action.';

            // Firestore errors
            case 'firestore/permission-denied':
                return 'You do not have permission to perform this action.';
            case 'firestore/unavailable':
                return 'Service temporarily unavailable. Please try again.';
            case 'firestore/deadline-exceeded':
                return 'Request timed out. Please try again.';
            case 'firestore/cancelled':
                return 'Operation was cancelled.';
            case 'firestore/not-found':
                return 'Requested item not found.';

            default:
                // Clean up generic Firebase error messages
                if (errorMessage.includes('Firebase:')) {
                    return 'An unexpected error occurred. Please try again.';
                }
                return errorMessage || 'An unexpected error occurred. Please try again.';
        }
    },

    /**
     * Check if error is a Firebase Auth error
     */
    isAuthError: (error: unknown): error is { code: string; message?: string } => {
        if (!error || typeof error !== 'object') return false;
        const code = (error as { code?: string }).code;
        return typeof code === 'string' && code.startsWith('auth/');
    },

    /**
     * Check if error is a Firestore error
     */
    isFirestoreError: (error: unknown): error is { code: string; message?: string } => {
        if (!error || typeof error !== 'object') return false;
        const code = (error as { code?: string }).code;
        return typeof code === 'string' && (code.startsWith('firestore/') || code.includes('permission-denied'));
    },
};

/**
 * Export types
 */
export type { Analytics, Auth, FirebaseApp, FirebaseStorage, Firestore };

/**
 * Default export for backward compatibility
 */
export default {
    get app() {
        return getApp();
    },
    get auth() {
        return getAuthInstance();
    },
    get db() {
        return getDb();
    },
    get storage() {
        return getStorageInstance();
    },
    get analytics() {
        return firebaseAnalytics;
    },
    utils: firebaseUtils,
    errors: firebaseErrors,
};