/**
 * Header Component
 * Top navigation header with user profile and actions
 * Available across all authenticated pages
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks";
import { motion } from "framer-motion";
import { HiOutlineCog6Tooth, HiOutlineUser } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";

/**
 * @Description Global header component with user profile and notifications
 * @Return {JSX.Element} The rendered header
 */
export const Header = () => {
    const { user, signOut } = useAuth();

    // Get user initials for avatar fallback
    const getInitials = (name?: string) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="fixed top-4 left-1/2 z-40 -translate-x-1/2 w-[95%] max-w-3xl md:top-6">
            {/* Advanced animated glow layers */}
            <motion.div
                className="absolute inset-0 -z-30 rounded-4xl bg-linear-to-t from-primary-500/40 via-primary-400/25 to-transparent blur-3xl"
                animate={{
                    opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute inset-0 -z-20 rounded-4xl bg-linear-to-t from-accent-500/25 via-transparent to-transparent blur-2xl"
                animate={{
                    opacity: [0.2, 0.35, 0.2],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                }}
            />
            <motion.div
                className="absolute inset-0 -z-10 rounded-4xl bg-linear-to-t from-secondary-500/15 via-transparent to-transparent blur-xl"
                animate={{
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
            />

            {/* Main header container with glassmorphism */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="group relative flex h-18 items-center justify-between rounded-3xl border border-neutral-200/60 bg-white/70 backdrop-blur-xl backdrop-saturate-150 px-6 shadow-2xl shadow-primary-500/5 transition-all duration-500 hover:border-primary-200/60 hover:bg-white/80 hover:shadow-primary-500/15"
            >
                {/* Animated shine effect on hover */}
                <div className="absolute inset-0 z-0 rounded-3xl bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-1000 group-hover:opacity-100 group-hover:animate-shimmer" />

                {/* Subtle inner glow */}
                <div className="absolute inset-px rounded-3xl bg-linear-to-br from-white/40 to-transparent opacity-60" />

                {/* Logo/Brand with enhanced styling */}
                <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <div className="relative">
                        {/* Logo background with glow */}
                        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary-500/10 to-accent-500/5 blur-lg opacity-50" />

                        {/* Logo text */}
                        <h1 className="relative text-lg font-extrabold bg-linear-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
                            AffiliateTracker
                        </h1>
                    </div>
                </motion.div>

                {/* Right side actions */}
                <div className="flex items-center gap-2.5">
                    {/* User menu with enhanced styling */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    variant="ghost"
                                    className="group/user gap-2.5 rounded-2xl px-3 py-2 h-auto bg-linear-to-br from-neutral-50/80 to-white/40 backdrop-blur-sm border border-neutral-200/50 hover:border-primary-300/50 hover:bg-linear-to-br hover:from-primary-50/60 hover:to-white/50 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-2.5">
                                        {/* Enhanced Avatar with ring effect */}
                                        <div className="relative">
                                            <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary-400/30 to-accent-400/30 blur-sm opacity-0 group-hover/user:opacity-100 transition-opacity duration-300" />
                                            <Avatar className="relative size-9 ring-2 ring-neutral-200/50 group-hover/user:ring-primary-300/50 transition-all duration-300">
                                                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                                                <AvatarFallback className="bg-linear-to-br from-primary-600 via-primary-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-primary-500/30">
                                                    {getInitials(user?.displayName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="hidden text-left lg:block">
                                            <p className="text-sm font-bold text-neutral-900">{user?.displayName || "User"}</p>
                                        </div>
                                    </div>
                                </Button>
                            </motion.div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60 border-neutral-200/60 bg-white/95 backdrop-blur-xl shadow-2xl">
                            <DropdownMenuLabel className="font-bold text-sm">My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-neutral-200/60" />
                            <DropdownMenuItem className="cursor-pointer gap-2.5 py-2.5 hover:bg-primary-50/50 transition-colors">
                                <HiOutlineUser className="size-4.5 text-neutral-600" />
                                <span className="font-medium">Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2.5 py-2.5 hover:bg-primary-50/50 transition-colors">
                                <HiOutlineCog6Tooth className="size-4.5 text-neutral-600" />
                                <span className="font-medium">Settings</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Enhanced Logout button */}
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-11 w-11 rounded-2xl bg-linear-to-br from-neutral-50/80 to-white/40 backdrop-blur-sm border border-neutral-200/50 hover:border-destructive-300/50 hover:bg-linear-to-br hover:from-destructive-50/60 hover:to-white/50 hover:text-destructive transition-all duration-300"
                            onClick={signOut}
                        >
                            <MdLogout className="size-5" />
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 rounded-2xl bg-destructive-500/20 opacity-0 hover:opacity-100 blur-md transition-opacity duration-300" />
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </header>
    );
};
