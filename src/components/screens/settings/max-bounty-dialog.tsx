"use client";

/**
 * @Description MaxBounty configuration dialog component with advanced UI
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BiTrophy } from "react-icons/bi";
import { HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";
import { IoCheckmarkCircleOutline, IoCloseOutline } from "react-icons/io5";
import { toast } from "sonner";
import { z } from "zod";

const maxBountySchema = z.object({
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
});

type MaxBountyFormData = z.infer<typeof maxBountySchema>;

interface MaxBountyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MaxBountyDialog: React.FC<MaxBountyDialogProps> = ({ open, onOpenChange }) => {
    const { preferences, updatePreferences } = useSettings();
    const [saving, setSaving] = useState(false);

    const form = useForm<MaxBountyFormData>({
        resolver: zodResolver(maxBountySchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Load existing values when dialog opens
    useEffect(() => {
        if (open && preferences?.cpaNetworks?.maxBounty) {
            const existing = preferences.cpaNetworks.maxBounty;
            form.reset({
                email: existing.email || "",
                password: existing.password || "",
            });
        }
    }, [open, preferences?.cpaNetworks?.maxBounty, form]);

    /**
     * @Description Handle save
     * @Params {MaxBountyFormData} data - Form data
     * @Return {Promise<void>}
     */
    const handleSave = async (data: MaxBountyFormData) => {
        setSaving(true);
        try {
            const existing = preferences?.cpaNetworks || {};
            await updatePreferences(
                {
                    cpaNetworks: {
                        ...existing,
                        maxBounty: {
                            email: data.email.trim(),
                            password: data.password.trim(),
                        },
                    },
                },
                { immediate: true }
            );
            toast.success("MaxBounty settings updated successfully.");
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Failed to save settings", {
                description: error?.message || "Could not save settings.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-accent-500 to-accent-600 shadow-md">
                            <BiTrophy className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-neutral-900">MaxBounty</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-neutral-600">
                        Configure your MaxBounty credentials. Your credentials are stored securely.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                                        <HiOutlineMail className="h-5 w-5 text-accent" />
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            variant="accent"
                                            placeholder="Enter your MaxBounty email"
                                            size="lg"
                                            disabled={saving}
                                            {...field}
                                            autoCapitalize="none"
                                        />
                                    </FormControl>
                                    <FormDescription>Your MaxBounty account email address.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                                        <HiOutlineLockClosed className="h-5 w-5 text-accent" />
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            variant="accent"
                                            placeholder="Enter your MaxBounty password"
                                            size="lg"
                                            disabled={saving}
                                            {...field}
                                            autoCapitalize="none"
                                        />
                                    </FormControl>
                                    <FormDescription>Your MaxBounty account password.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <motion.div
                            className="rounded-xl border-2 border-accent/20 bg-accent-50/50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <p className="text-sm font-medium text-accent-900">
                                Used to authenticate requests to MaxBounty. Stored securely in your preferences.
                            </p>
                        </motion.div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => onOpenChange(false)}
                                outline
                                rightIcon={IoCloseOutline}
                                size="lg"
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={saving}
                                disabled={saving}
                                rightIcon={IoCheckmarkCircleOutline}
                            >
                                Save Settings
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
