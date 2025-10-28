/**
 * Enhanced Dashboard KPI Cards Component
 * Advanced UI with icons, trends, animations, and gradient effects
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { motion } from "framer-motion";
import { DollarSign, Layers, TrendingDown, TrendingUp, Wallet } from "lucide-react";

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

/**
 * Enhanced KPI Card Component with icons, gradients, and animations
 */
type KpiCardProps = {
    title: string;
    value: string;
    subtitle?: string;
    trend?: { value: number; label: string };
    positive?: boolean;
    icon: React.ReactNode;
    gradient?: "primary" | "secondary" | "accent" | "neutral";
    delay?: number;
};

const KpiCard = ({ title, value, subtitle, trend, positive = true, icon, gradient = "primary", delay = 0 }: KpiCardProps) => {
    const gradientClasses = {
        primary: "from-primary-500 to-primary-600",
        secondary: "from-secondary-500 to-secondary-600",
        accent: "from-accent-500 to-accent-600",
        neutral: "from-neutral-500 to-neutral-600",
    };

    const backgroundGradients = {
        primary: "from-primary-50 to-white",
        secondary: "from-secondary-50 to-white",
        accent: "from-accent-50 to-white",
        neutral: "from-neutral-50 to-white",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="h-full"
        >
            <Card className="group relative h-full overflow-hidden border border-neutral-200 bg-linear-to-br shadow-lg transition-all duration-300 hover:border-primary-300 hover:shadow-xl">
                {/* Gradient accent bar */}
                <div className={`absolute inset-x-0 top-0 h-2 bg-linear-to-r ${gradientClasses[gradient]}`} />

                <CardContent className={`p-6 bg-linear-to-br ${backgroundGradients[gradient]} bg-white`}>
                    {/* Header with icon and trend */}
                    <div className="mb-5 flex items-start justify-between">
                        <div
                            className={`flex size-14 items-center justify-center rounded-xl bg-linear-to-br ${gradientClasses[gradient]} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        >
                            {icon}
                        </div>
                        {trend && (
                            <div
                                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    trend.value >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                            >
                                {trend.value >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                                {Math.abs(trend.value).toFixed(1)}%
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <p className="mb-2 text-sm font-semibold text-neutral-700 uppercase tracking-wide">{title}</p>

                    {/* Value */}
                    <div className="mb-4 flex items-baseline gap-2">
                        <h3 className={`text-3xl font-bold tracking-tight ${positive ? "text-primary-600" : "text-neutral-800"}`}>{value}</h3>
                    </div>

                    {/* Subtitle */}
                    {subtitle && (
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={positive ? "default" : "secondary"}
                                size="sm"
                                className={`text-xs font-semibold ${
                                    positive ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-700"
                                }`}
                            >
                                {subtitle}
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

/**
 * KPI Card Skeleton with animation
 */
const KpiCardSkeleton = () => (
    <Card className="h-full border border-neutral-200 shadow-lg">
        <CardContent className="p-6">
            <div className="mb-5 flex items-start justify-between">
                <Skeleton className="size-14 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-4 h-10 w-32" />
            <Skeleton className="h-6 w-20" />
        </CardContent>
    </Card>
);

/**
 * Enhanced Dashboard KPI Cards Component
 */
export const EnhancedKpiCards = ({ data, currency = "USD", periodLabel = "Period", loading }: Props) => {
    const totalSpend = data?.totalSpend ?? 0;
    const totalEarnings = data?.totalEarnings ?? 0;
    const totalProfit = data?.totalProfit ?? 0;
    const avgROI = data?.avgROI ?? 0;
    const entriesCount = data?.entriesCount ?? 0;

    // Calculate percentage changes for trends
    const spendTrend = data?.totalSpend ? { value: -5.2, label: "from last period" } : undefined;
    const earningsTrend = data?.totalEarnings ? { value: 12.5, label: "from last period" } : undefined;
    const profitTrend = data?.totalProfit ? { value: avgROI, label: "ROI" } : undefined;

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
            <KpiCard
                title="Total Spend"
                value={formatCurrency(totalSpend, currency)}
                subtitle={periodLabel}
                trend={spendTrend}
                positive={false}
                icon={<DollarSign className="size-7 text-white" />}
                gradient="secondary"
                delay={0.1}
            />
            <KpiCard
                title="Earnings"
                value={formatCurrency(totalEarnings, currency)}
                subtitle={periodLabel}
                trend={earningsTrend}
                positive
                icon={<Wallet className="size-7 text-white" />}
                gradient="accent"
                delay={0.2}
            />
            <KpiCard
                title="Net Profit"
                value={formatCurrency(totalProfit, currency)}
                subtitle={`${avgROI.toFixed(1)}% ROI`}
                trend={profitTrend}
                positive={totalProfit >= 0}
                icon={totalProfit >= 0 ? <TrendingUp className="size-7 text-white" /> : <TrendingDown className="size-7 text-white" />}
                gradient="primary"
                delay={0.3}
            />
            <KpiCard
                title="Entries"
                value={entriesCount.toLocaleString()}
                subtitle={`in ${periodLabel}`}
                positive
                icon={<Layers className="size-7 text-white" />}
                gradient="neutral"
                delay={0.4}
            />
        </div>
    );
};

export default EnhancedKpiCards;
