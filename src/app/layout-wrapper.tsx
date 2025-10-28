"use client";

import { Header } from "@/components/layout";
import { BottomNav } from "@/components/navigation";
import { useAuth } from "@/hooks";

interface LayoutWrapperProps {
    children: React.ReactNode;
}

/**
 * @Description Layout wrapper component to conditionally show header and nav
 * @Params {ReactNode} children - Page content to render
 * @Return {JSX.Element} The wrapped layout with header and nav for authenticated users
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
    const { isAuthenticated, isInitializing } = useAuth();

    // Show loading state during initialization
    if (isInitializing) {
        return null;
    }

    // Show header and nav only for authenticated users
    if (isAuthenticated) {
        return (
            <div className="mx-auto max-w-3xl">
                <Header />
                <div className="pt-24">{children}</div>
                <BottomNav />
            </div>
        );
    }

    // For unauthenticated users, just show children
    return <>{children}</>;
}
