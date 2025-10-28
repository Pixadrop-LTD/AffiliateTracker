/**
 * @Description Account selector component for automation screen
 * Displays grouped ad accounts with checkboxes
 */

import { motion } from "framer-motion";
import { Check, Square } from "lucide-react";

interface Account {
    id: string;
    name?: string;
}

interface AccountGroup {
    business: { id: string; name?: string } | null;
    accounts: Account[];
}

interface AccountSelectorProps {
    title: string;
    icon: React.ReactNode;
    linkedCount: number;
    groups: AccountGroup[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    loading?: boolean;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({ title, icon, linkedCount, groups, selectedIds, onToggle, loading = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-secondary-200 bg-secondary-50/50 p-4 shadow-lg"
        >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="font-semibold text-neutral-900">{title}</h3>
                </div>
                <span className="text-sm text-neutral-600">{linkedCount} linked</span>
            </div>

            {/* Content */}
            {loading && groups.length === 0 ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-200" />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-neutral-500">No accounts found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {groups.map((group, idx) => (
                        <div key={`${group.business?.id || "user"}-${idx}`} className="space-y-2">
                            {/* Group Header */}
                            <div className="flex items-center justify-between rounded-md bg-primary-50 px-2 py-1">
                                <span className="text-[11px] font-semibold uppercase text-primary-700">
                                    {group.business ? group.business.name || group.business.id : "Your Ad Accounts"}
                                </span>
                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                                    {group.accounts.length} accounts
                                </span>
                            </div>

                            {/* Accounts */}
                            {group.accounts.map((account) => {
                                const isSelected = selectedIds.has(account.id);
                                return (
                                    <motion.button
                                        key={account.id}
                                        onClick={() => onToggle(account.id)}
                                        className={`w-full rounded-lg px-3 py-2 text-left transition-all ${
                                            isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
                                        }`}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {isSelected ? (
                                                    <Check className="size-5 text-primary-600" />
                                                ) : (
                                                    <Square className="size-5 text-neutral-500" />
                                                )}
                                                <span className={`text-sm ${isSelected ? "font-medium text-primary-800" : "text-neutral-800"}`}>
                                                    {account.name || account.id}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-700">
                                                    Selected
                                                </span>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
