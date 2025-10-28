import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
    "placeholder:text-muted-foreground focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex field-sizing-content w-full rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                xs: "min-h-12 px-2 py-1.5 text-xs",
                sm: "min-h-14 px-2.5 py-2 text-xs",
                default: "min-h-16 px-3 py-2 text-base md:text-sm",
                lg: "min-h-20 px-4 py-3 text-base",
                xl: "min-h-24 px-5 py-4 text-lg",
            },
            variant: {
                default: "border-input focus-visible:border-ring focus-visible:ring-ring/50",
                ghost: "border-transparent shadow-none hover:bg-accent focus:bg-accent",
                primary:
                    "border border-primary-300 bg-primary-50 text-primary-700 focus-visible:border-primary-500 focus-visible:ring-primary-500/20",
                secondary:
                    "border border-secondary-300 bg-secondary-50 text-secondary-700 focus-visible:border-secondary-500 focus-visible:ring-secondary-500/20",
                accent: "border border-accent-300 bg-accent-50 text-accent-700 focus-visible:border-accent-500 focus-visible:ring-accent-500/20",
                neutral:
                    "border border-neutral-300 bg-neutral-50 text-neutral-700 focus-visible:border-neutral-500 focus-visible:ring-neutral-500/20",
            },
        },
        defaultVariants: {
            size: "default",
            variant: "default",
        },
    }
);

export interface TextareaProps extends React.ComponentProps<"textarea">, VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, size, variant, ...props }, ref) => {
    return <textarea ref={ref} data-slot="textarea" className={cn(textareaVariants({ size, variant }), className)} {...props} />;
});

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
