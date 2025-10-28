import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean().default(false),
});

/**
 * Register form validation schema
 */
export const registerSchema = z
    .object({
        email: z.string().email("Invalid email format").min(1, "Email is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
        acceptTerms: z.boolean().refine((val) => val === true, {
            message: "You must accept the terms and conditions",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format").min(1, "Email is required"),
});

export type LoginFormData = z.input<typeof loginSchema>;
export type RegisterFormData = z.input<typeof registerSchema>;
export type ForgotPasswordFormData = z.input<typeof forgotPasswordSchema>;

