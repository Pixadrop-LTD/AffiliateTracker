"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { HiCheck } from "react-icons/hi2";

import { cn } from "@/lib/utils";

const checkboxVariants = cva(
    "peer focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-50",
                primary:
                    "border-primary-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 data-[state=checked]:text-primary-50",
                secondary:
                    "border-secondary-300 data-[state=checked]:bg-secondary-600 data-[state=checked]:border-secondary-600 data-[state=checked]:text-secondary-50",
                accent: "border-accent-300 data-[state=checked]:bg-accent-600 data-[state=checked]:border-accent-600 data-[state=checked]:text-accent-50",
                neutral:
                    "border-neutral-300 data-[state=checked]:bg-neutral-600 data-[state=checked]:border-neutral-600 data-[state=checked]:text-neutral-50",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root>, VariantProps<typeof checkboxVariants> {}

function Checkbox({ className, variant, ...props }: CheckboxProps) {
    return (
        <CheckboxPrimitive.Root data-slot="checkbox" className={cn(checkboxVariants({ variant }), className)} {...props}>
            <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-content-center text-current transition-none">
                <HiCheck className="size-3.5" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox, checkboxVariants };
