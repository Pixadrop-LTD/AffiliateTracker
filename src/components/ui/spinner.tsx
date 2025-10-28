import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ImSpinner2 } from "react-icons/im";

const spinnerVariants = cva("animate-spin", {
    variants: {
        size: {
            xs: "size-3",
            sm: "size-4",
            md: "size-6",
            lg: "size-8",
            xl: "size-10",
        },
        variant: {
            primary: "text-primary-600",
            secondary: "text-secondary-600",
            accent: "text-accent-600",
            neutral: "text-neutral-600",
            success: "text-green-600",
            warning: "text-yellow-600",
            error: "text-red-600",
            info: "text-blue-600",
            ghost: "text-white",
        },
    },
    defaultVariants: {
        size: "md",
        variant: "primary",
    },
});

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, variant, ...props }: SpinnerProps) {
    return (
        <div role="status" aria-label="Loading" className="inline-flex items-center justify-center" {...props}>
            <ImSpinner2 className={cn(spinnerVariants({ size, variant }), className)} />
        </div>
    );
}

export { Spinner };
