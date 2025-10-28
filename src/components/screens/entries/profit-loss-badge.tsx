import { cn } from "@/lib/utils";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

interface ProfitLossBadgeProps {
    profit: number;
    showAmount?: boolean;
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

/**
 * @Description Displays a badge indicating profit or loss with appropriate color coding.
 * @Params {Object} props - The component props.
 * @Params {number} props.profit - The profit amount (positive = profit, negative = loss).
 * @Params {boolean} [props.showAmount] - Whether to display the amount alongside the icon.
 * @Params {'xs' | 'sm' | 'md' | 'lg'} [props.size] - Size variant of the badge.
 * @Params {string} [props.className] - Additional CSS classes.
 * @Return {JSX.Element} The rendered profit/loss badge.
 */
export const ProfitLossBadge = ({ profit, showAmount = true, size = "sm", className }: ProfitLossBadgeProps) => {
    const isProfit = profit >= 0;
    const Icon = isProfit ? FiTrendingUp : FiTrendingDown;

    const sizeClasses = {
        xs: "h-3.5 w-3.5 text-[8px] font-semibold",
        sm: "h-4 w-4 text-[10px] font-semibold",
        md: "h-5 w-5 text-xs font-bold",
        lg: "h-6 w-6 text-sm font-bold",
    };

    const amountClasses = {
        xs: "text-[8px] ml-0.5",
        sm: "text-[9px] ml-0.5",
        md: "text-xs ml-1",
        lg: "text-sm ml-1.5",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-1.5 border",
                isProfit
                    ? "border-emerald-300/50 bg-linear-to-r from-emerald-50 to-emerald-100/30 text-emerald-700"
                    : "border-red-300/50 bg-linear-to-r from-red-50 to-red-100/30 text-red-700",
                sizeClasses[size],
                className
            )}
        >
            <Icon className={sizeClasses[size]} />
            {showAmount && (
                <span className={cn("ml-0.5 font-semibold", isProfit ? "text-emerald-700" : "text-red-700", amountClasses[size])}>
                    {profit >= 0 ? "+" : ""}
                    {Math.abs(profit).toFixed(0)}
                </span>
            )}
        </div>
    );
};
