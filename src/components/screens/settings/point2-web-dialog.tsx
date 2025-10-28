"use client";

/**
 * @Description Point2Web configuration dialog component with advanced UI
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
import { HiOutlineKey, HiOutlineLink } from "react-icons/hi";
import { IoCheckmarkCircleOutline, IoCloseOutline } from "react-icons/io5";
import { toast } from "sonner";
import { z } from "zod";

const point2WebSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
});

type Point2WebFormData = z.infer<typeof point2WebSchema>;

interface Point2WebDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const Point2WebDialog: React.FC<Point2WebDialogProps> = ({ open, onOpenChange }) => {
    const { preferences, updatePreferences } = useSettings();
    const [saving, setSaving] = useState(false);

    const form = useForm<Point2WebFormData>({
        resolver: zodResolver(point2WebSchema),
        defaultValues: {
            apiKey: "",
        },
    });

    // Load existing values when dialog opens
    useEffect(() => {
        if (open && preferences?.cpaNetworks?.point2Web) {
            const existing = preferences.cpaNetworks.point2Web;
            form.reset({
                apiKey: existing.apiKey || "",
            });
        }
    }, [open, preferences?.cpaNetworks?.point2Web, form]);

    /**
     * @Description Handle save
     * @Params {Point2WebFormData} data - Form data
     * @Return {Promise<void>}
     */
    const handleSave = async (data: Point2WebFormData) => {
        setSaving(true);
        try {
            const existing = preferences?.cpaNetworks || {};
            await updatePreferences(
                {
                    cpaNetworks: {
                        ...existing,
                        point2Web: {
                            apiKey: data.apiKey.trim(),
                        },
                    },
                },
                { immediate: true }
            );
            toast.success("Point2Web settings updated successfully.");
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
                            <HiOutlineLink className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-neutral-900">Point2Web</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-neutral-600">
                        Configure your Point2Web credentials. Your credentials are stored securely.
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
                                        <HiOutlineKey className="h-5 w-5 text-accent" />
                                        API Key
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            variant="accent"
                                            placeholder="Enter your Point2Web API Key"
                                            size="lg"
                                            disabled={saving}
                                            {...field}
                                            autoCapitalize="none"
                                        />
                                    </FormControl>
                                    <FormDescription>Your Point2Web API key for authentication.</FormDescription>
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
                            <p className="text-sm font-medium text-accent-900">API key is used for authenticated requests to Point2Web.</p>
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
