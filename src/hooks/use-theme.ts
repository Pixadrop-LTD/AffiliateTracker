/**
 * useTheme Hook
 * Provides theme management functionality
 */

'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useTheme() {
    const { theme, setTheme, systemTheme } = useNextTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';
    const isLight = currentTheme === 'light';

    const toggleTheme = () => {
        if (theme === 'dark') {
            setTheme('light');
        } else if (theme === 'light') {
            setTheme('dark');
        } else {
            // If system, toggle to opposite of current system theme
            setTheme(systemTheme === 'dark' ? 'light' : 'dark');
        }
    };

    return {
        theme: currentTheme,
        setTheme,
        toggleTheme,
        isDark,
        isLight,
        mounted,
    };
}

export default useTheme;

