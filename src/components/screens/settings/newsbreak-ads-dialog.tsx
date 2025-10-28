"use client";

/**
 * @Description Newsbreak Ads configuration dialog component with advanced UI
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
import { BsLink45Deg } from "react-icons/bs";
import { HiOutlineLink, HiOutlineLockClosed } from "react-icons/hi";
import { IoCheckmarkCircleOutline, IoCloseOutline } from "react-icons/io5";
import { toast } from "sonner";
import { z } from "zod";

const newsbreakAdsSchema = z.object({
    token: z.string().min(1, "API Token is required"),
    orgIds: z.string().optional(),
});

type NewsbreakAdsFormData = z.infer<typeof newsbreakAdsSchema>;

interface NewsbreakAdsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const NewsbreakAdsDialog: React.FC<NewsbreakAdsDialogProps> = ({ open, onOpenChange }) => {
    const { preferences, updatePreferences } = useSettings();
    const [saving, setSaving] = useState(false);

    const form = useForm<NewsbreakAdsFormData>({
        resolver: zodResolver(newsbreakAdsSchema),
        defaultValues: {
            token: "",
            orgIds: "",
        },
    });

    // Load existing values when dialog opens
    useEffect(() => {
        if (open && preferences?.adNetworks?.newsbreak) {
            const existing = preferences.adNetworks.newsbreak;
            form.reset({
                token: existing.token || "",
                orgIds: (existing.orgIds || []).join(","),
            });
        }
    }, [open, preferences?.adNetworks?.newsbreak, form]);

    /**
     * @Description Handle save
     * @Params {NewsbreakAdsFormData} data - Form data
     * @Return {Promise<void>}
     */
    const handleSave = async (data: NewsbreakAdsFormData) => {
        setSaving(true);
        try {
            const existing = preferences?.adNetworks || {};
            const cleanedOrgIds = data.orgIds
                ? data.orgIds
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                : undefined;

            await updatePreferences(
                {
                    adNetworks: {
                        ...existing,
                        newsbreak: {
                            token: data.token.trim(),
                            orgIds: cleanedOrgIds,
                        },
                    },
                },
                { immediate: true }
            );
            toast.success("Newsbreak settings updated successfully.");
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
                            <BsLink45Deg className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-neutral-900">Newsbreak Ads</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-neutral-600">
                        Configure your Newsbreak Ads credentials. Your credentials are stored securely.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                                        <HiOutlineLockClosed className="h-5 w-5 text-accent" />
                                        API Token
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            variant="accent"
                                            placeholder="Enter Newsbreak API Token"
                                            size="lg"
                                            disabled={saving}
                                            {...field}
                                            autoCapitalize="none"
                                        />
                                    </FormControl>
                                    <FormDescription>Your Newsbreak API token for authentication.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="orgIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                                        <HiOutlineLink className="h-5 w-5 text-secondary" />
                                        Organization IDs
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            variant="accent"
                                            placeholder="Comma-separated IDs (e.g., 0128,1729, 9729)"
                                            size="lg"
                                            disabled={saving}
                                            {...field}
                                            autoCapitalize="none"
                                        />
                                    </FormControl>
                                    <FormDescription>Separate multiple Organization IDs with commas.</FormDescription>
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
                                Your credentials are stored securely and used only for API requests from your device.
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
