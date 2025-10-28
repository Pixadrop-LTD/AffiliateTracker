/**
 * @Description Automation schedule configuration component with react-hook-form integration
 * Handles enable/disable toggle and time picker
 */

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface AutomationScheduleProps {
    enabled: boolean;
    time: string;
    onToggle: (enabled: boolean) => void;
    onTimeChange: (time: string) => void;
    saving: boolean;
}

// Form schema
const automationSchema = z.object({
    enabled: z.boolean().default(false),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

type AutomationFormValues = z.infer<typeof automationSchema>;

/**
 * @Description Automation schedule component with form handling
 * @Params {Object} props - The component props
 * @Return {JSX.Element} The rendered automation schedule component
 */
export const AutomationSchedule: React.FC<AutomationScheduleProps> = ({ enabled, time, onToggle, onTimeChange, saving }) => {
    const form = useForm<AutomationFormValues>({
        resolver: zodResolver(automationSchema),
        defaultValues: {
            enabled,
            time,
        },
    });

    // Sync form with props
    useEffect(() => {
        form.reset({ enabled, time });
    }, [enabled, time]);

    /**
     * @Description Handles form submission
     */
    const onSubmit = (data: AutomationFormValues) => {
        onToggle(data.enabled);
        onTimeChange(data.time);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-lg border border-neutral-200 bg-white shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
                <div className="flex-1">
                    <h3 className="font-medium text-neutral-900">Daily Automation</h3>
                    <p className="mt-1 text-sm text-neutral-500">Configure time to auto-fetch and upsert daily entry</p>
                </div>
                <Clock className="size-5 text-primary-600" />
            </div>

            {/* Content */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
                    {/* Toggle */}
                    <FormField
                        control={form.control}
                        name="enabled"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-neutral-800">Enable Automation</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={saving} />
                                    </FormControl>
                                </div>
                                <FormDescription>Automatically fetch and create entries at the specified time</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Time Picker */}
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-neutral-800">Daily Time</FormLabel>
                                <FormControl>
                                    <Input type="time" variant="primary" {...field} disabled={!form.watch("enabled") || saving} />
                                </FormControl>
                                <FormDescription>Select the time to run daily automation</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </motion.div>
    );
};
