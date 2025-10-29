/**
 * Profit Chart Component
 * Displays profit trends using Recharts with multiple chart types
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export type DailyPoint = {
    date: string;
    spend: number;
    earnings: number;
    profit: number;
};

export type ChartType = "line" | "bar" | "area";

type Props = {
    data?: DailyPoint[] | null;
    currency?: string;
    label?: string;
    chartType?: ChartType;
    onChartTypeChange?: (type: ChartType) => void;
};

/**
 * Chart configuration
 */
const chartConfig = {
    profit: {
        label: "Profit",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

/**
 * Custom Tooltip Component
 */
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border bg-background p-3 shadow-md">
                <p className="text-sm font-medium text-muted-foreground">{data.dateLabel}</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(data.profit, "USD")}</p>
                <div className="mt-2 flex gap-4 text-xs">
                    <span className="text-muted-foreground">Spend: {formatCurrency(data.spend, "USD")}</span>
                    <span className="text-muted-foreground">Earn: {formatCurrency(data.earnings, "USD")}</span>
                </div>
            </div>
        );
    }
    return null;
};

export const ProfitChart = ({ data, currency = "USD", label = "", chartType = "line", onChartTypeChange }: Props) => {
    // Transform data for chart
    const chartData =
        (data ?? []).map((d, idx) => ({
            x: idx + 1,
            profit: d.profit,
            spend: d.spend,
            earnings: d.earnings,
            dateLabel: new Date(d.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
        })) ?? [];

    const hasData = chartData.length > 0;

    // Chart type toggle buttons
    const chartTypeButtons: ChartType[] = ["line", "area", "bar"];
    const chartTypeLabels: Record<ChartType, string> = {
        line: "LINE",
        area: "AREA",
        bar: "BAR",
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-primary-600" />
                    <h3 className="text-lg font-semibold">Profit Trend</h3>
                </div>
                <div className="flex items-center gap-2">
                    {label && (
                        <Badge variant="neutral" size="sm" className="mr-2">
                            {label}
                        </Badge>
                    )}
                    {onChartTypeChange && (
                        <div className="flex gap-1">
                            {chartTypeButtons.map((type) => (
                                <Button
                                    key={type}
                                    variant={chartType === type ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => onChartTypeChange(type)}
                                    className="h-7 text-xs"
                                >
                                    {chartTypeLabels[type]}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        {chartType === "line" ? (
                            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatCurrency(value, currency)}
                                />
                                <ChartTooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="var(--color-primary)"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        ) : chartType === "area" ? (
                            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatCurrency(value, currency)}
                                />
                                <ChartTooltip content={<CustomTooltip />} />
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="profit" stroke="var(--color-primary)" fill="url(#gradient)" strokeWidth={2} />
                            </AreaChart>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatCurrency(value, currency)}
                                />
                                <ChartTooltip content={<CustomTooltip />} />
                                <Bar dataKey="profit" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        )}
                    </ChartContainer>
                ) : (
                    <div className="flex h-[300px] items-center justify-center">
                        <div className="text-center">
                            <Skeleton className="mx-auto mb-4 h-[200px] w-full max-w-md" />
                            <p className="text-sm text-muted-foreground">No data available</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfitChart;
