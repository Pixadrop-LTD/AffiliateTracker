import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                xs: "h-6 px-2 py-0.5 text-xs",
                sm: "h-7 px-2.5 py-1 text-xs",
                default: "h-9 px-3 py-2 text-base md:text-sm",
                lg: "h-10 px-4 py-2.5 text-base",
                xl: "h-11 px-5 py-3 text-lg",
            },
            variant: {
                default: "border-input",
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

export interface InputProps extends Omit<React.ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {
    type?: React.HTMLInputTypeAttribute;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, size, variant, type, ...props }, ref) => {
    return (
        <input
            type={type}
            ref={ref}
            data-slot="input"
            className={cn(
                inputVariants({ size, variant }),
                "focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    );
});

Input.displayName = "Input";

export { Input, inputVariants };
