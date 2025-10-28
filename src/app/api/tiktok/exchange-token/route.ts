import { NextRequest, NextResponse } from "next/server";

/**
 * @Description API route to exchange short-lived TikTok access token for long-lived token
 * This route is secure as it keeps the app secret on the server
 */

/**
 * @Description Exchange authorization code for access token and refresh token
 * Docs: https://ads.tiktok.com/marketing_api/docs?id=1739965703387137
 * @Params {string} authCode - Authorization code from TikTok OAuth callback
 * @Return {Promise<{accessToken: string, refreshToken: string, expiresIn: number}>}
 */
async function exchangeForAccessToken(authCode: string, appId: string, appSecret: string, redirectUri: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const url = "https://ads.tiktok.com/marketing_api/auth_v2/token/";

    const body = new URLSearchParams({
        client_key: appId,
        client_secret: appSecret,
        auth_code: authCode,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    });

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    const json: any = await res.json();
    if (!res.ok) {
        const message = json?.message || json?.error_description || "Failed to exchange code for access token";
        throw new Error(message);
    }

    if (!json?.access_token) {
        throw new Error("Exchange response missing access_token");
    }

    // TikTok access tokens are valid for 24 hours
    // Refresh tokens are valid for 1 year
    return {
        accessToken: String(json.access_token),
        refreshToken: String(json.refresh_token),
        expiresIn: json?.expires_in || 86400, // 24 hours in seconds
    };
}

/**
 * POST /api/tiktok/exchange-token
 * Exchange short-lived token for long-lived token
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { authCode, redirectUri } = body;

        if (!authCode) {
            return NextResponse.json({ error: "Authorization code is required" }, { status: 400 });
        }

        if (!redirectUri) {
            return NextResponse.json({ error: "Redirect URI is required" }, { status: 400 });
        }

        const appId = process.env.NEXT_PUBLIC_TIKTOK_APP_ID;
        const appSecret = process.env.TIKTOK_APP_SECRET;

        if (!appId || !appSecret) {
            return NextResponse.json({ error: "TikTok configuration missing" }, { status: 500 });
        }

        const result = await exchangeForAccessToken(authCode, appId, appSecret, redirectUri);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error exchanging TikTok token:", error);
        return NextResponse.json({ error: error.message || "Failed to exchange token" }, { status: 500 });
    }
}

