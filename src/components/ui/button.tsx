import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import type { IconType } from "react-icons";

import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px]",
    {
        variants: {
            variant: {
                primary: "bg-primary-600 text-primary-50 hover:bg-primary-700 focus-visible:ring-primary-500/50",
                secondary: "bg-secondary-600 text-secondary-50 hover:bg-secondary-700 focus-visible:ring-secondary-500/50",
                accent: "bg-accent-600 text-accent-50 hover:bg-accent-700 focus-visible:ring-accent-500/50",
                destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
                neutral: "bg-neutral-600 text-neutral-50 hover:bg-neutral-700 focus-visible:ring-neutral-500/50",
                ghost: "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus-visible:ring-neutral-300/50",
                default: "bg-primary-600 text-primary-50 hover:bg-primary-700 focus-visible:ring-primary-500/50",
            },
            outline: {
                true: "border-2 bg-transparent",
                false: "border-2 border-transparent",
            },
            size: {
                xs: "h-6 rounded-md gap-1 px-2 py-1 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-8 rounded-md gap-1.5 px-3 py-1.5 text-xs has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3.5",
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                lg: "h-10 rounded-md px-6 py-2.5 has-[>svg]:px-4",
                xl: "h-11 rounded-md px-8 py-3 has-[>svg]:px-5",
                icon: "size-9",
                "icon-xs": "size-6",
                "icon-sm": "size-8",
                "icon-lg": "size-10",
                "icon-xl": "size-11",
            },
        },
        compoundVariants: [
            {
                variant: "primary",
                outline: true,
                className: "border-primary-600 text-primary-600 hover:bg-primary-600/10 hover:text-primary-700",
            },
            {
                variant: "secondary",
                outline: true,
                className: "border-secondary-600 text-secondary-600 hover:bg-secondary-600/10 hover:text-secondary-700",
            },
            {
                variant: "accent",
                outline: true,
                className: "border-accent-600 text-accent-600 hover:bg-accent-600/10 hover:text-accent-700",
            },
            {
                variant: "destructive",
                outline: true,
                className: "border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive",
            },
            {
                variant: "neutral",
                outline: true,
                className: "border-neutral-600 text-neutral-600 hover:bg-neutral-600/10 hover:text-neutral-700",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
            outline: false,
        },
    }
);

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    leftIcon?: IconType;
    rightIcon?: IconType;
    loading?: boolean;
}

function Button({
    className,
    variant,
    size,
    outline,
    asChild = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    children,
    loading,
    disabled,
    ...props
}: ButtonProps) {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
        <Comp data-slot="button" className={cn(buttonVariants({ variant, size, outline, className }))} disabled={isDisabled} {...props}>
            {loading ? (
                <Spinner size="sm" variant="ghost" />
            ) : (
                <>
                    {LeftIcon && <LeftIcon className="size-4" />}
                    {children}
                    {RightIcon && <RightIcon className="size-4" />}
                </>
            )}
        </Comp>
    );
}

export { Button, buttonVariants };
