/**
 * Protected Route Component
 * Wraps pages that require authentication and redirects unauthenticated users
 */

"use client";

import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * @Description Component that protects routes by checking authentication state
 * @Params {ReactNode} children - The content to render if authenticated
 * @Return {JSX.Element} Loading spinner, auth redirect, or children
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isInitializing } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isInitializing && !isAuthenticated) {
            // Redirect to home page if not authenticated
            router.push("/");
        }
    }, [isInitializing, isAuthenticated, router, pathname]);

    // Show loading state during initialization
    if (isInitializing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 via-primary-50/20 to-secondary-50">
                <div className="text-center">
                    <Spinner size="lg" variant="primary" className="mx-auto" />
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated (will redirect in useEffect)
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};

