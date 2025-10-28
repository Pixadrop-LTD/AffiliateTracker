"use client";

/**
 * @Description CashNetwork configuration dialog component with advanced UI
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
import { BiDollarCircle } from "react-icons/bi";
import { HiOutlineKey } from "react-icons/hi";
import { IoCheckmarkCircleOutline, IoCloseOutline } from "react-icons/io5";
import { toast } from "sonner";
import { z } from "zod";

const cashNetworkSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
});

type CashNetworkFormData = z.infer<typeof cashNetworkSchema>;

interface CashNetworkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CashNetworkDialog: React.FC<CashNetworkDialogProps> = ({ open, onOpenChange }) => {
    const { preferences, updatePreferences } = useSettings();
    const [saving, setSaving] = useState(false);

    const form = useForm<CashNetworkFormData>({
        resolver: zodResolver(cashNetworkSchema),
        defaultValues: {
            apiKey: "",
        },
    });

    // Load existing values when dialog opens
    useEffect(() => {
        if (open && preferences?.cpaNetworks?.cashNetwork) {
            const existing = preferences.cpaNetworks.cashNetwork;
            form.reset({
                apiKey: existing.apiKey || "",
            });
        }
    }, [open, preferences?.cpaNetworks?.cashNetwork, form]);

    /**
     * @Description Handle save
     * @Params {CashNetworkFormData} data - Form data
     * @Return {Promise<void>}
     */
    const handleSave = async (data: CashNetworkFormData) => {
        setSaving(true);
        try {
            const existing = preferences?.cpaNetworks || {};
            await updatePreferences(
                {
                    cpaNetworks: {
                        ...existing,
                        cashNetwork: {
                            apiKey: data.apiKey.trim(),
                        },
                    },
                },
                { immediate: true }
            );
            toast.success("CashNetwork settings updated successfully.");
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-primary-600 shadow-md">
                            <BiDollarCircle className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-neutral-900">CashNetwork</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-neutral-600">
                        Configure your CashNetwork credentials. Your credentials are stored securely.
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
                                        <HiOutlineKey className="h-5 w-5 text-primary" />
                                        API Key
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            variant="primary"
                                            placeholder="Enter your CashNetwork API Key"
                                            size="lg"
                                            disabled={saving}
                                            {...field}
                                            autoCapitalize="none"
                                        />
                                    </FormControl>
                                    <FormDescription>Your CashNetwork API key for authentication.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <motion.div
                            className="rounded-xl border-2 border-primary/20 bg-primary-50/50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <p className="text-sm font-medium text-primary-900">API key is used for authenticated requests to CashNetwork.</p>
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
