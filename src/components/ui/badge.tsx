import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
                neutral: "border-transparent bg-neutral-100 text-neutral-700 [a&]:hover:bg-neutral-200",
                primary: "border-transparent bg-primary-100 text-primary-700 [a&]:hover:bg-primary-200",
                secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
                accent: "border-transparent bg-accent-100 text-accent-700 [a&]:hover:bg-accent-200",
                success: "border-transparent bg-green-100 text-green-700 [a&]:hover:bg-green-200",
                warning: "border-transparent bg-yellow-100 text-yellow-700 [a&]:hover:bg-yellow-200",
                error: "border-transparent bg-red-100 text-red-700 [a&]:hover:bg-red-200",
                info: "border-transparent bg-blue-100 text-blue-700 [a&]:hover:bg-blue-200",
                destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20",
                outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
            },
            size: {
                xs: "px-1.5 py-0.5 text-[10px] min-h-[16px] [&>svg]:size-2.5 gap-0.5",
                sm: "px-2 py-0.5 text-xs min-h-[20px] [&>svg]:size-3 gap-1",
                md: "px-2.5 py-1 text-sm min-h-[24px] [&>svg]:size-3.5 gap-1",
                lg: "px-3 py-1.5 text-base min-h-[28px] [&>svg]:size-4 gap-1.5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

function Badge({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "span";

    return <Comp data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
