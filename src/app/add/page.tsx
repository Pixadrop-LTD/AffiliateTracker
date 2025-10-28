"use client";

/**
 * @Description Automation & Account Configuration Screen
 * Allows users to select ad accounts and configure automated entry creation
 */

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AccountSelector } from "@/components/screens/automation/account-selector";
import { AutomationSchedule } from "@/components/screens/automation/automation-schedule";
import { RevenueSourceCard } from "@/components/screens/automation/revenue-source-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/use-settings";
import { FacebookAdsClient } from "@/services/integrations/facebook-ads.client";
import { NewsbreakClient } from "@/services/integrations/newsbreak.client";
import { motion } from "framer-motion";
import { Briefcase, CarIcon, Cog, Globe, Newspaper, Sparkles, SquareStack } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const AddPageContent = () => {
    const router = useRouter();
    const { preferences, isLoading } = useSettings();

    // Account selection state
    const [fbSelected, setFbSelected] = useState<Set<string>>(new Set());
    const [nbSelected, setNbSelected] = useState<Set<string>>(new Set());

    // Automation state
    const [automationEnabled, setAutomationEnabled] = useState(false);
    const [dailyTime, setDailyTime] = useState("00:00");
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Account groups
    const [fbGroups, setFbGroups] = useState<{ business: { id: string; name?: string } | null; accounts: { id: string; name?: string }[] }[]>([]);
    const [nbGroups, setNbGroups] = useState<{ id: string; name?: string; adAccounts: { id: string; name?: string }[] }[]>([]);
    const [loadingLists, setLoadingLists] = useState(false);

    // Initialize from preferences
    useEffect(() => {
        if (preferences) {
            const fbSel = new Set((preferences.adNetworks?.facebook?.selectedAccountIds || []).map((v) => String(v)));
            const nbSel = new Set((preferences.adNetworks?.newsbreak?.selectedAccountIds || []).map((v) => String(v)));
            setFbSelected(fbSel);
            setNbSelected(nbSel);
            setAutomationEnabled(Boolean(preferences.automation?.enabled));
            setDailyTime(preferences.automation?.dailyTime || "00:00");
        }
    }, [preferences]);

    // Linked/Configured states
    const fbCount = preferences?.adNetworks?.facebook?.accessToken ? 1 : 0;
    const nbOrgCount = preferences?.adNetworks?.newsbreak?.orgIds?.length ?? 0;
    const nbCount = nbOrgCount > 0 ? nbOrgCount : preferences?.adNetworks?.newsbreak?.token ? 1 : 0;
    const mbConfigured = Boolean(preferences?.cpaNetworks?.maxBounty?.email || preferences?.cpaNetworks?.maxBounty?.password);
    const pcbConfigured = Boolean(preferences?.cpaNetworks?.performCb?.apiKey || preferences?.cpaNetworks?.performCb?.partnerId);
    const cnConfigured = Boolean(preferences?.cpaNetworks?.cashNetwork?.apiKey);
    const p2wConfigured = Boolean(preferences?.cpaNetworks?.point2Web?.apiKey);

    // Toggle handlers
    const toggleFb = useCallback((id: string) => {
        setFbSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleNb = useCallback((id: string) => {
        setNbSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    // Save handler
    const handleSave = async () => {
        if (!preferences) return;

        try {
            setSaving(true);

            // In a real app, you would call updatePreferences here
            // await updatePreferences({
            //     adNetworks: {
            //         facebook: { selectedAccountIds: Array.from(fbSelected) },
            //         newsbreak: { selectedAccountIds: Array.from(nbSelected) },
            //     },
            //     automation: { enabled: automationEnabled, dailyTime },
            // }, { immediate: true });

            toast.success("Saved", {
                description: "Automation settings updated successfully.",
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unable to save preferences";
            toast.error("Save Failed", {
                description: message,
            });
        } finally {
            setSaving(false);
        }
    };

    // Load account lists
    const loadLists = useCallback(async () => {
        try {
            setLoadingLists(true);
            const fbAccess = preferences?.adNetworks?.facebook?.accessToken;
            const nbToken = preferences?.adNetworks?.newsbreak?.token;
            const nbOrgIds = preferences?.adNetworks?.newsbreak?.orgIds || [];

            const fbRes: typeof fbGroups = [];
            if (fbAccess) {
                const fbClient = new FacebookAdsClient({ accessToken: fbAccess });
                try {
                    const businesses = await fbClient.listBusinesses();
                    if (Array.isArray(businesses) && businesses.length) {
                        for (const b of businesses) {
                            let accs: { id: string; name?: string }[] = [];
                            try {
                                const fetched = await fbClient.listBusinessAdAccounts(b.id);
                                accs = (fetched || []).map((a) => ({ id: a.id, name: a.name }));
                            } catch {
                                accs = [];
                            }
                            fbRes.push({
                                business: { id: b.id, name: b.name },
                                accounts: accs,
                            });
                        }
                    }
                } catch {}

                // Supplement with user-level accounts
                try {
                    const included = new Set<string>();
                    fbRes.forEach((g) => g.accounts.forEach((a) => included.add(a.id)));
                    const groupIndexByBizId = new Map<string, number>();
                    fbRes.forEach((g, idx) => {
                        if (g.business?.id) groupIndexByBizId.set(g.business.id, idx);
                    });

                    const accs = await fbClient.listUserAdAccounts();
                    const remaining = (accs || []).filter((a) => !included.has(a.id));

                    const userGroup: {
                        business: { id: string; name?: string } | null;
                        accounts: { id: string; name?: string }[];
                    } = {
                        business: null,
                        accounts: [],
                    };

                    for (const a of remaining) {
                        try {
                            const biz = await fbClient.getAdAccountBusiness(a.id);
                            if (biz && biz.id) {
                                let idx = groupIndexByBizId.get(biz.id);
                                if (idx === undefined) {
                                    fbRes.push({ business: { id: biz.id, name: biz.name }, accounts: [] });
                                    idx = fbRes.length - 1;
                                    groupIndexByBizId.set(biz.id, idx);
                                }
                                fbRes[idx].accounts.push({ id: a.id, name: a.name });
                            } else {
                                userGroup.accounts.push({ id: a.id, name: a.name });
                            }
                        } catch {
                            userGroup.accounts.push({ id: a.id, name: a.name });
                        }
                    }

                    if (userGroup.accounts.length) {
                        fbRes.push(userGroup);
                    }
                } catch {}
            }
            setFbGroups(fbRes);

            if (nbToken) {
                const nbClient = new NewsbreakClient({ token: nbToken, orgIds: nbOrgIds });
                try {
                    const groups = await nbClient.listAdAccountsGrouped();
                    const byId = new Map<string, { id: string; name?: string; adAccounts: { id: string; name?: string }[] }>();
                    (groups || []).forEach((g) => byId.set(g.id, g));
                    (nbOrgIds || []).forEach((id) => {
                        if (!byId.has(id)) byId.set(id, { id, name: id, adAccounts: [] });
                    });
                    setNbGroups(Array.from(byId.values()));
                } catch {
                    if (nbOrgIds.length) {
                        setNbGroups(nbOrgIds.map((id) => ({ id, name: id, adAccounts: [] })));
                    } else {
                        setNbGroups([]);
                    }
                }
            } else {
                if (nbOrgIds.length) {
                    setNbGroups(nbOrgIds.map((id) => ({ id, name: id, adAccounts: [] })));
                } else {
                    setNbGroups([]);
                }
            }
        } finally {
            setLoadingLists(false);
        }
    }, [preferences?.adNetworks?.facebook?.accessToken, preferences?.adNetworks?.newsbreak?.token, preferences?.adNetworks?.newsbreak?.orgIds]);

    // Load lists on mount and when preferences change
    useEffect(() => {
        loadLists();
    }, [loadLists]);

    // Refresh handler
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadLists();
        setRefreshing(false);
        toast.success("Refreshed", { description: "Account lists updated." });
    }, [loadLists]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-neutral-50 via-background to-primary-50/30 p-4 pb-28">
                <div className="container mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Add Entry | Affiliate Tracker</title>
                <meta name="description" content="Add a new affiliate marketing entry to track your ad spend and revenue" />
                <meta name="robots" content="index, follow" />
            </Head>
            <div className="min-h-screen bg-linear-to-br from-neutral-50 via-background to-primary-50/30 p-4 pb-28">
                <div className="container mx-auto max-w-4xl space-y-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-xl">
                                <Cog className="size-5 text-neutral-700" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Accounts & Automation</h1>
                                <p className="mt-1 text-sm text-neutral-600">Select accounts and configure daily automation</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            loading={refreshing}
                            className="rounded-xl shadow-sm"
                        >
                            Refresh
                        </Button>
                    </motion.div>

                    {/* Facebook Ads Section */}
                    <AccountSelector
                        title="Facebook Ads"
                        icon={<SquareStack className="size-5 text-primary-600" />}
                        linkedCount={fbCount}
                        groups={fbGroups}
                        selectedIds={fbSelected}
                        onToggle={toggleFb}
                        loading={loadingLists}
                    />

                    {/* Newsbreak Ads Section */}
                    <AccountSelector
                        title="Newsbreak Ads"
                        icon={<Newspaper className="size-5 text-primary-600" />}
                        linkedCount={nbCount}
                        groups={nbGroups.map((g) => ({
                            business: { id: g.id, name: g.name },
                            accounts: g.adAccounts,
                        }))}
                        selectedIds={nbSelected}
                        onToggle={toggleNb}
                        loading={loadingLists}
                    />

                    {/* Revenue Sources */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="space-y-3"
                    >
                        <h3 className="text-sm font-semibold text-neutral-700">Revenue Sources</h3>
                        <div className="flex flex-wrap gap-[2%]">
                            <RevenueSourceCard name="MaxBounty" icon={<Briefcase className="size-4 text-primary-600" />} configured={mbConfigured} />
                            <RevenueSourceCard name="PerformCB" icon={<Sparkles className="size-4 text-primary-600" />} configured={pcbConfigured} />
                            <RevenueSourceCard name="CashNetwork" icon={<CarIcon className="size-4 text-primary-600" />} configured={cnConfigured} />
                            <RevenueSourceCard name="Point2Web" icon={<Globe className="size-4 text-primary-600" />} configured={p2wConfigured} />
                        </div>
                    </motion.div>

                    {/* Automation Schedule */}
                    <AutomationSchedule
                        enabled={automationEnabled}
                        time={dailyTime}
                        onToggle={setAutomationEnabled}
                        onTimeChange={setDailyTime}
                        saving={saving}
                    />

                    {/* Save Button */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            loading={saving}
                            variant="primary"
                            size="lg"
                            className="w-full rounded-xl shadow-lg"
                        >
                            Save Automation Settings
                        </Button>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

/**
 * Protected Add Page
 */
export default function AddPage() {
    return (
        <ProtectedRoute>
            <AddPageContent />
        </ProtectedRoute>
    );
}
