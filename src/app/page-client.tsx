"use client";

/**
 * Client-side Home Page Component
 * Handles authentication logic and renders appropriate view
 */

import { AuthForm } from "@/components/auth/auth-form";
import { DashboardLoadingScreen, DashboardScreen } from "@/components/screens/dashboard/dashboard-screen";
import { useAuth } from "@/hooks";

/**
 * @Description Client component that handles authentication state and renders dashboard or auth form
 * @Return {JSX.Element} The dashboard, loading screen, or auth form based on auth state
 */
export const HomeClient = () => {
    const { isAuthenticated, isInitializing } = useAuth();

    // Show loading state during initial auth check
    if (isInitializing) {
        return <DashboardLoadingScreen />;
    }

    // Show auth form if not authenticated
    if (!isAuthenticated) {
        return <AuthForm />;
    }

    // Show dashboard for authenticated users
    return <DashboardScreen />;
};
