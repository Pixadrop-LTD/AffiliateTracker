"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 aria-invalid:border-destructive whitespace-nowrap",
    {
        variants: {
            variant: {
                default:
                    "bg-transparent hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50",
                outline:
                    "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50",
                primary:
                    "bg-transparent hover:bg-primary-50 hover:text-primary-700 data-[state=on]:bg-primary-600 data-[state=on]:text-primary-50 focus-visible:border-primary focus-visible:ring-primary-500/50",
                secondary:
                    "bg-transparent hover:bg-secondary-50 hover:text-secondary-700 data-[state=on]:bg-secondary-600 data-[state=on]:text-secondary-50 focus-visible:border-secondary focus-visible:ring-secondary-500/50",
                accent: "bg-transparent hover:bg-accent-50 hover:text-accent-700 data-[state=on]:bg-accent-600 data-[state=on]:text-accent-50 focus-visible:border-accent focus-visible:ring-accent-500/50",
                neutral:
                    "bg-transparent hover:bg-neutral-50 hover:text-neutral-700 data-[state=on]:bg-neutral-600 data-[state=on]:text-neutral-50 focus-visible:border-neutral focus-visible:ring-neutral-500/50",
            },
            size: {
                default: "h-9 px-2 min-w-9",
                sm: "h-8 px-1.5 min-w-8",
                lg: "h-10 px-2.5 min-w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Toggle({ className, variant, size, ...props }: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
    return <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} {...props} />;
}

export { Toggle, toggleVariants };
