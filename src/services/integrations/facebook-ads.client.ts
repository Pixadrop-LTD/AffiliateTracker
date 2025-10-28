/**
 * @Description Facebook Ads API client for fetching account information
 */

export interface FacebookBusiness {
    id: string;
    name?: string;
}

export interface FacebookAdAccount {
    id: string;
    account_id?: string;
    name?: string;
}

export interface FacebookAdsCredentials {
    accessToken: string;
}

const FB_API = 'https://graph.facebook.com/v19.0';

/**
 * @Description Fetch JSON from API with error handling
 */
const fetchJson = async (url: string, init?: RequestInit) => {
    const res = await fetch(url, init);
    const text = await res.text();
    let data: any = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (e) {
        // ignore parse errors
    }
    if (!res.ok) {
        const err = (data && data.error) || text || res.statusText;
        throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
    }
    return data;
};

export class FacebookAdsClient {
    constructor(private creds: FacebookAdsCredentials) { }

    /**
     * @Description List all businesses associated with the access token
     */
    async listBusinesses(): Promise<FacebookBusiness[]> {
        try {
            const url = `${FB_API}/me/businesses?fields=id,name&access_token=${encodeURIComponent(this.creds.accessToken)}`;
            const data = await fetchJson(url);
            return (data?.data || []) as FacebookBusiness[];
        } catch (error) {
            console.error('Error listing businesses:', error);
            return [];
        }
    }

    /**
     * @Description List ad accounts for a specific business
     */
    async listBusinessAdAccounts(businessId: string): Promise<FacebookAdAccount[]> {
        try {
            const url = `${FB_API}/${businessId}/owned_ad_accounts?fields=id,account_id,name&access_token=${encodeURIComponent(this.creds.accessToken)}`;
            const data = await fetchJson(url);
            return (data?.data || []) as FacebookAdAccount[];
        } catch (error) {
            console.error('Error listing business ad accounts:', error);
            return [];
        }
    }

    /**
     * @Description List all user ad accounts (not grouped by business)
     */
    async listUserAdAccounts(): Promise<FacebookAdAccount[]> {
        try {
            let accounts: FacebookAdAccount[] = [];
            let nextUrl = `${FB_API}/me/adaccounts?limit=50&fields=id,account_id,name&access_token=${encodeURIComponent(this.creds.accessToken)}`;

            // Paginate through ad accounts
            while (nextUrl) {
                const data = await fetchJson(nextUrl);
                const list = (data?.data as FacebookAdAccount[]) || [];
                accounts = accounts.concat(list);
                nextUrl = data?.paging?.next || '';
            }

            return accounts;
        } catch (error) {
            console.error('Error listing user ad accounts:', error);
            return [];
        }
    }

    /**
     * @Description Get business information for an ad account
     */
    async getAdAccountBusiness(accountId: string): Promise<FacebookBusiness | null> {
        try {
            const url = `${FB_API}/${accountId}?fields=business&access_token=${encodeURIComponent(this.creds.accessToken)}`;
            const data = await fetchJson(url);
            return data?.business || null;
        } catch (error) {
            console.error('Error getting ad account business:', error);
            return null;
        }
    }

    /**
     * @Description Get business details by ID
     */
    async getBusiness(businessId: string): Promise<FacebookBusiness | null> {
        try {
            const url = `${FB_API}/${businessId}?fields=id,name&access_token=${encodeURIComponent(this.creds.accessToken)}`;
            const data = await fetchJson(url);
            return data as FacebookBusiness;
        } catch (error) {
            console.error('Error getting business:', error);
            return null;
        }
    }
}

