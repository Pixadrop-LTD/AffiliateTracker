/**
 * Bottom Navigation Component
 * Floating bottom navigation with 5 tabs: Dashboard, Entries, Add, Reports, Settings
 * Matches the mobile app's bottom tab navigation design
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { FaList, FaListUl } from "react-icons/fa";
import { FiBarChart2 } from "react-icons/fi";
import { HiCog6Tooth, HiHome, HiOutlineCog6Tooth, HiOutlineHome } from "react-icons/hi2";
import { MdAdd } from "react-icons/md";

type NavItem = {
    id: string;
    label: string;
    path: string;
    icon: typeof HiHome;
    activeIcon: typeof HiHome;
    badge?: number;
};

const navItems: NavItem[] = [
    {
        id: "dashboard",
        label: "Home",
        path: "/",
        icon: HiOutlineHome,
        activeIcon: HiHome,
    },
    {
        id: "entries",
        label: "Entries",
        path: "/entries",
        icon: FaList,
        activeIcon: FaListUl,
        badge: 0,
    },
    {
        id: "add",
        label: "Add",
        path: "/add",
        icon: MdAdd,
        activeIcon: MdAdd,
    },
    {
        id: "reports",
        label: "Reports",
        path: "/reports",
        icon: FiBarChart2,
        activeIcon: FiBarChart2,
    },
    {
        id: "settings",
        label: "Settings",
        path: "/settings",
        icon: HiOutlineCog6Tooth,
        activeIcon: HiCog6Tooth,
    },
];

/**
 * @Description Floating bottom navigation component with advanced UI
 * @Return {JSX.Element} The rendered bottom navigation
 */
export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => {
        if (path === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(path);
    };

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    return (
        <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:bottom-8">
            {/* Decorative gradient glow */}
            <div className="absolute inset-0 -z-10 translate-y-1 rounded-3xl bg-linear-to-t from-primary-500/20 via-transparent to-transparent blur-xl" />

            <div className="relative flex items-center gap-1 rounded-3xl border border-neutral-200/80 bg-white/95 px-3 py-3 shadow-2xl shadow-primary-500/10 backdrop-blur-2xl transition-all hover:border-neutral-300/80 hover:shadow-primary-500/20">
                {/* Background gradient for active state */}
                <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary-50/50 via-transparent to-accent-50/50 opacity-50" />

                {navItems.map((item, index) => {
                    const active = isActive(item.path);
                    const Icon = active ? item.activeIcon : item.icon;
                    const isAddButton = item.id === "add";

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => handleNavigate(item.path)}
                            className={cn(
                                "group relative flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300",
                                active
                                    ? "bg-linear-to-br from-primary-50 to-primary-100/50 text-primary-700 shadow-sm shadow-primary-500/20"
                                    : "hover:bg-neutral-50 text-neutral-600"
                            )}
                            whileHover={{ scale: isAddButton ? 1.08 : 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={false}
                        >
                            {/* Animated gradient overlay on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            <div className="relative z-10">
                                <motion.div
                                    animate={{
                                        scale: active ? 1 : 1,
                                        rotate: active ? [0, 5, -5, 0] : 0,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Icon className="size-6 transition-all duration-300" />
                                </motion.div>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <Badge
                                        variant="error"
                                        size="xs"
                                        className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center px-1 py-0 text-[10px] font-bold shadow-sm"
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                            </div>

                            <span
                                className={cn(
                                    "relative z-10 text-[10px] font-semibold transition-all duration-300",
                                    active ? "text-primary-700" : "text-neutral-600 group-hover:text-neutral-800"
                                )}
                            >
                                {item.label}
                            </span>

                            {/* Active indicator with glow */}
                            {active && (
                                <>
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-linear-to-r from-transparent via-primary-600 to-transparent shadow-lg shadow-primary-600/50"
                                        layoutId="activeTab"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            bounce: 0.3,
                                            duration: 0.6,
                                        }}
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-primary-600/5" />
                                </>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </nav>
    );
};
