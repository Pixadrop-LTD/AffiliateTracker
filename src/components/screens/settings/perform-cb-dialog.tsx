"use client";

/**
 * @Description PerformCB configuration dialog component with advanced UI
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
import { BiNetworkChart } from "react-icons/bi";
import { HiOutlineKey, HiOutlineUser } from "react-icons/hi";
import { IoCheckmarkCircleOutline, IoCloseOutline } from "react-icons/io5";
import { toast } from "sonner";
import { z } from "zod";

const performCbSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
    partnerId: z.string().min(1, "Partner ID is required"),
});

type PerformCbFormData = z.infer<typeof performCbSchema>;

interface PerformCBDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const PerformCBDialog: React.FC<PerformCBDialogProps> = ({ open, onOpenChange }) => {
    const { preferences, updatePreferences } = useSettings();
    const [saving, setSaving] = useState(false);

    const form = useForm<PerformCbFormData>({
        resolver: zodResolver(performCbSchema),
        defaultValues: {
            apiKey: "",
            partnerId: "",
        },
    });

    // Load existing values when dialog opens
    useEffect(() => {
        if (open && preferences?.cpaNetworks?.performCb) {
            const existing = preferences.cpaNetworks.performCb;
            form.reset({
                apiKey: existing.apiKey || "",
                partnerId: existing.partnerId || "",
            });
        }
    }, [open, preferences?.cpaNetworks?.performCb, form]);

    /**
     * @Description Handle save
     * @Params {PerformCbFormData} data - Form data
     * @Return {Promise<void>}
     */
    const handleSave = async (data: PerformCbFormData) => {
        setSaving(true);
        try {
            const existing = preferences?.cpaNetworks || {};
            await updatePreferences(
                {
                    cpaNetworks: {
                        ...existing,
                        performCb: {
                            apiKey: data.apiKey.trim(),
                            partnerId: data.partnerId.trim(),
                        },
                    },
                },
                { immediate: true }
            );
            toast.success("PerformCB settings updated successfully.");
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-secondary-500 to-secondary-600 shadow-md">
                            <BiNetworkChart className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-neutral-900">PerformCB</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-neutral-600">
                        Configure your PerformCB credentials. Your credentials are stored securely.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="apiKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                                        <HiOutlineKey className="h-5 w-5 text-secondary" />
                                        API Key
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            variant="secondary"
                                            placeholder="Enter your PerformCB API Key"
                                            size="lg"
                                            disabled={saving}
                                            {...field}
                                            autoCapitalize="none"
                                        />
                                    </FormControl>
                                    <FormDescription>Your PerformCB API key for authentication.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="partnerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                                        <HiOutlineUser className="h-5 w-5 text-secondary" />
                                        Partner ID
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            variant="secondary"
                                            placeholder="Enter your Partner ID"
                                            size="lg"
                                            disabled={saving}
                                            {...field}
                                            autoCapitalize="none"
                                        />
                                    </FormControl>
                                    <FormDescription>Your PerformCB partner ID.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <motion.div
                            className="rounded-xl border-2 border-secondary/20 bg-secondary-50/50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <p className="text-sm font-medium text-secondary-900">
                                API key and partner ID are used for authenticated requests to PerformCB.
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
                            <Button type="submit" variant="primary" size="lg" loading={saving} disabled={saving} rightIcon={IoCheckmarkCircleOutline}>
                                Save Settings
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
