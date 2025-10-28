import { NextResponse } from "next/server";

/**
 * @Description Proxy middleware to handle protected routes
 * This replaces the deprecated middleware.ts convention
 * @Return {NextResponse} Response to continue
 */
export const proxy = () => {
    // Allow all requests to pass through
    // ProtectedRoute components handle authentication on the client side
    return NextResponse.next();
};

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};

