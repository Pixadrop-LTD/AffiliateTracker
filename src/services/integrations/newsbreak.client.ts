/**
 * @Description Newsbreak Ads API client for fetching account information
 */

export interface NewsbreakCredentials {
    token: string;
    orgIds?: string[];
}

export interface NewsbreakOrgGroup {
    id: string;
    name?: string;
    adAccounts: { id: string; name?: string }[];
}

const API_BASE = 'https://business.newsbreak.com/business-api/v1';

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
        const err = (data && (data.error || data.message)) || text || res.statusText;
        throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
    }
    return data;
};

export class NewsbreakClient {
    constructor(private creds: NewsbreakCredentials) { }

    /**
     * @Description Get headers for API requests
     */
    private headers() {
        return { 'Access-Token': this.creds.token } as Record<string, string>;
    }

    /**
     * @Description List ad accounts grouped by organization
     */
    async listAdAccountsGrouped(): Promise<NewsbreakOrgGroup[]> {
        const { orgIds } = this.creds;
        if (!orgIds?.length) return [];

        const pageSize = 200;
        let pageNo = 1;
        let groups: any[] = [];

        try {
            while (true) {
                const qs = [
                    ...orgIds.map((id) => `orgIds=${encodeURIComponent(id)}`),
                    `pageNo=${pageNo}`,
                    `pageSize=${pageSize}`,
                ].join('&');
                const url = `${API_BASE}/ad-account/getGroupsByOrgIds?${qs}`;
                const data = await fetchJson(url, { headers: this.headers() });

                if (data?.code !== 0) break;

                const d = data?.data;
                const list = ((d?.list as any[]) ?? (Array.isArray(d) ? (d as any[]) : [])) || [];

                if (Array.isArray(list) && list.length) {
                    groups = groups.concat(list);
                }

                const hasNext: boolean = Boolean(d?.hasNext);
                if (!hasNext) break;
                pageNo += 1;
            }

            // Deduplicate by org id and merge ad accounts across pages
            const byKey = new Map<string, any>();
            for (const g of groups) {
                const key = String(g?.orgId ?? g?.id ?? '');
                if (!byKey.has(key)) {
                    byKey.set(key, g);
                } else {
                    const existing = byKey.get(key);
                    const all = [
                        ...((existing?.adAccounts as any[]) || []),
                        ...((g?.adAccounts as any[]) || []),
                    ];
                    const accMap = new Map<string, any>();
                    all.forEach((a: any) =>
                        accMap.set(String(a?.id ?? a?.adAccountId ?? a?.accountId ?? ''), a)
                    );
                    existing.adAccounts = Array.from(accMap.values());
                    byKey.set(key, existing);
                }
            }

            return Array.from(byKey.values()).map((g) => ({
                id: String(g?.orgId ?? g?.id ?? ''),
                name: g?.orgName ?? g?.name,
                adAccounts: ((g?.adAccounts || []) as any[]).map((a: any) => ({
                    id: String(a?.id ?? a?.adAccountId ?? a?.accountId ?? ''),
                    name: a?.name ?? a?.adAccountName,
                })),
            }));
        } catch (error) {
            console.error('Error listing ad accounts grouped:', error);
            return [];
        }
    }
}

