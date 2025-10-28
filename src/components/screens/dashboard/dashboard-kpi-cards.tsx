/**
 * Dashboard KPI Cards Component
 * Displays key metrics in a responsive grid layout
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

export type DashboardSummary = {
    totalSpend: number;
    totalEarnings: number;
    totalProfit: number;
    avgROI: number;
    entriesCount: number;
};

type Props = {
    data?: DashboardSummary | null;
    currency?: string;
    periodLabel?: string;
    loading?: boolean;
};

type KpiCardProps = {
    title: string;
    value: string;
    subtitle?: string;
    positive?: boolean;
};

/**
 * Individual KPI Card Component
 */
const KpiCard = ({ title, value, subtitle, positive = true }: KpiCardProps) => (
    <Card className="border-0 shadow-lg transition-all hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
            {subtitle && (
                <Badge variant={positive ? "success" : "error"} size="xs">
                    {subtitle}
                </Badge>
            )}
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

/**
 * KPI Card Skeleton
 */
const KpiCardSkeleton = () => (
    <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-32" />
        </CardContent>
    </Card>
);

/**
 * Dashboard KPI Cards Component
 */
export const DashboardKpiCards = ({ data, currency = "USD", periodLabel = "Period", loading }: Props) => {
    const totalSpend = data?.totalSpend ?? 0;
    const totalEarnings = data?.totalEarnings ?? 0;
    const totalProfit = data?.totalProfit ?? 0;
    const avgROI = data?.avgROI ?? 0;
    const entriesCount = data?.entriesCount ?? 0;

    const spendText = formatCurrency(totalSpend, currency);
    const earningsText = formatCurrency(totalEarnings, currency);
    const profitText = formatCurrency(totalProfit, currency);
    const roiText = `${avgROI.toFixed(1)}%`;

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Total Spend" value={spendText} subtitle={periodLabel} positive={false} />
            <KpiCard title="Earnings" value={earningsText} subtitle={periodLabel} positive />
            <KpiCard title="Profit" value={profitText} subtitle={`ROI: ${roiText}`} positive={totalProfit >= 0} />
            <KpiCard title="Total Entries" value={entriesCount.toString()} subtitle={periodLabel} positive />
        </div>
    );
};

export default DashboardKpiCards;
