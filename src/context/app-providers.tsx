/**
 * AppProviders
 * Combined provider component that wraps all necessary context providers
 */

'use client';

import { AuthProvider } from './auth-provider';
import { ThemeProvider } from './theme-provider';
import type { ReactNode } from 'react';

interface AppProvidersProps {
    children: ReactNode;
}

/**
 * App-level providers wrapper
 * Provides Auth and Theme context to the entire app
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
    );
}

export default AppProviders;

