/**
 * @Description Revenue source status card component
 * Displays configuration status for revenue sources
 */

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface RevenueSourceCardProps {
    name: string;
    icon: React.ReactNode;
    configured: boolean;
}

export const RevenueSourceCard: React.FC<RevenueSourceCardProps> = ({
    name,
    icon,
    configured,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-[49%] rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium text-neutral-900">{name}</span>
                </div>
                <div
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${
                        configured ? 'bg-primary-100' : 'bg-neutral-100'
                    }`}
                >
                    {configured ? (
                        <Check className="size-3 text-primary-600" />
                    ) : (
                        <X className="size-3 text-neutral-500" />
                    )}
                </div>
            </div>
        </motion.div>
    );
};
