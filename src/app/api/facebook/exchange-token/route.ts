import { NextRequest, NextResponse } from "next/server";

/**
 * @Description API route to exchange short-lived Facebook access token for long-lived token
 * This route is secure as it keeps the app secret on the server
 */

/**
 * @Description Exchange a short-lived user access token for a long-lived token
 * @Params {string} shortToken - Short-lived access token from Facebook OAuth
 * @Return {Promise<{accessToken: string, expiresIn?: number}>}
 */
async function exchangeForLongLivedToken(shortToken: string, appId: string, appSecret: string): Promise<{ accessToken: string; expiresIn?: number }> {
    const url =
        `https://graph.facebook.com/v23.0/oauth/access_token?` +
        new URLSearchParams({
            grant_type: "fb_exchange_token",
            client_id: appId,
            client_secret: appSecret,
            fb_exchange_token: shortToken,
        }).toString();

    const res = await fetch(url, { method: "GET" });
    const json: any = await res.json();
    if (!res.ok) {
        const message = json?.error?.message || "Failed to exchange token for long-lived token";
        throw new Error(message);
    }
    if (!json?.access_token) {
        throw new Error("Exchange response missing access_token");
    }
    return { accessToken: String(json.access_token), expiresIn: json?.expires_in };
}

/**
 * POST /api/facebook/exchange-token
 * Exchange short-lived token for long-lived token
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { shortToken } = body;

        if (!shortToken) {
            return NextResponse.json({ error: "Short token is required" }, { status: 400 });
        }

        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;

        if (!appId || !appSecret) {
            return NextResponse.json({ error: "Facebook configuration missing" }, { status: 500 });
        }

        const result = await exchangeForLongLivedToken(shortToken, appId, appSecret);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error exchanging Facebook token:", error);
        return NextResponse.json({ error: error.message || "Failed to exchange token" }, { status: 500 });
    }
}

