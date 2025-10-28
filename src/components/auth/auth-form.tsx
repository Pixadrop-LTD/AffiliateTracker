/**
 * Auth Form Component
 * Unified authentication form supporting login, register, and forgot password
 * Uses shadcn form with react-hook-form and zod validation
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks";
import type { ForgotPasswordFormData, LoginFormData, RegisterFormData } from "@/lib/validations/auth";
import { forgotPasswordSchema, loginSchema, registerSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight, FaEye, FaEyeSlash, FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import Logo from "../logo";

type AuthMode = "login" | "register" | "forgot-password";

interface AuthFormProps {
    mode?: AuthMode;
    onModeChange?: (mode: AuthMode) => void;
}

export function AuthForm({ mode = "login", onModeChange }: AuthFormProps) {
    const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signIn, signUp, signInWithGoogle, signInWithFacebook, resetPassword, loading } = useAuth();

    // Login form
    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    // Register form
    const registerForm = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        },
    });

    // Forgot password form
    const forgotPasswordForm = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const handleModeChange = (newMode: AuthMode) => {
        setCurrentMode(newMode);
        loginForm.reset();
        registerForm.reset();
        forgotPasswordForm.reset();
        onModeChange?.(newMode);
    };

    const onLoginSubmit = async (data: LoginFormData) => {
        try {
            await signIn(data.email, data.password);
            toast.success("Welcome back!", {
                description: "You have been signed in successfully.",
            });
        } catch (err: any) {
            const errorMessage = err.message || "Invalid email or password. Please try again.";

            // Check for common Firebase auth errors and set field errors
            if (err.code === "auth/invalid-email" || err.code === "auth/user-not-found") {
                loginForm.setError("email", { message: "Invalid email address" });
            } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                loginForm.setError("password", { message: "Invalid password" });
            } else if (err.code === "auth/too-many-requests") {
                toast.error("Too many failed attempts", {
                    description: "Account temporarily locked. Please try again later.",
                });
            } else {
                toast.error("Authentication failed", {
                    description: errorMessage,
                });
            }
        }
    };

    const onRegisterSubmit = async (data: RegisterFormData) => {
        try {
            await signUp(data.email, data.password);
            toast.success("Account created!", {
                description: "Your account has been created successfully.",
            });
            handleModeChange("login");
        } catch (err: any) {
            const errorMessage = err.message || "Unable to create account. Please try again.";

            // Check for common Firebase auth errors and set field errors
            if (err.code === "auth/email-already-in-use") {
                registerForm.setError("email", { message: "Email already in use" });
                toast.error("Registration failed", {
                    description: "This email is already registered. Please use a different email or sign in.",
                });
            } else if (err.code === "auth/invalid-email") {
                registerForm.setError("email", { message: "Invalid email address" });
            } else if (err.code === "auth/weak-password") {
                registerForm.setError("password", { message: "Password should be at least 6 characters" });
            } else if (err.code === "auth/network-request-failed") {
                toast.error("Network error", {
                    description: "Please check your internet connection and try again.",
                });
            } else {
                toast.error("Registration failed", {
                    description: errorMessage,
                });
            }
        }
    };

    const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await resetPassword(data.email);
            toast.success("Reset link sent!", {
                description: "Please check your email for password reset instructions.",
            });
            handleModeChange("login");
        } catch (err: any) {
            const errorMessage = err.message || "Unable to send reset link. Please try again.";

            // Check for common Firebase auth errors and set field errors
            if (err.code === "auth/user-not-found") {
                forgotPasswordForm.setError("email", { message: "No account found with this email" });
            } else if (err.code === "auth/invalid-email") {
                forgotPasswordForm.setError("email", { message: "Invalid email address" });
            } else if (err.code === "auth/too-many-requests") {
                toast.error("Too many attempts", {
                    description: "Please try again later.",
                });
            } else {
                toast.error("Failed to send reset link", {
                    description: errorMessage,
                });
            }
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            toast.success("Signed in with Google", {
                description: "Welcome! You are now signed in.",
            });
        } catch (err: any) {
            const errorMessage = err.message || "Unable to sign in with Google. Please try again.";

            // Firebase-specific error codes
            if (err.code === "auth/popup-closed-by-user") {
                toast.error("Sign-in cancelled", {
                    description: "Please try again if you want to sign in with Google.",
                });
            } else if (err.code === "auth/popup-blocked") {
                toast.error("Popup blocked", {
                    description: "Please allow popups for this site and try again.",
                });
            } else if (err.code === "auth/account-exists-with-different-credential") {
                toast.error("Account exists", {
                    description: "An account with this email already exists using a different provider.",
                });
            } else {
                toast.error("Google sign-in failed", {
                    description: errorMessage,
                });
            }
        }
    };

    const handleFacebookSignIn = async () => {
        try {
            await signInWithFacebook();
            toast.success("Signed in with Facebook", {
                description: "Welcome! You are now signed in.",
            });
        } catch (err: any) {
            const errorMessage = err.message || "Unable to sign in with Facebook. Please try again.";

            // Firebase-specific error codes
            if (err.code === "auth/popup-closed-by-user") {
                toast.error("Sign-in cancelled", {
                    description: "Please try again if you want to sign in with Facebook.",
                });
            } else if (err.code === "auth/popup-blocked") {
                toast.error("Popup blocked", {
                    description: "Please allow popups for this site and try again.",
                });
            } else if (err.code === "auth/account-exists-with-different-credential") {
                toast.error("Account exists", {
                    description: "An account with this email already exists using a different provider.",
                });
            } else {
                toast.error("Facebook sign-in failed", {
                    description: errorMessage,
                });
            }
        }
    };

    // Subtle animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    };

    const headerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    return (
        <div className="flex min-h-screen items-center justify-center relative p-4 overflow-hidden bg-linear-to-br from-neutral-50 via-primary-50/30 to-secondary-50/40">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 size-80 rounded-full bg-primary-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-secondary-500/10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-accent-500/5 blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand Header */}
                <motion.div initial="hidden" animate="visible" variants={headerVariants} transition={{ duration: 0.3 }} className="mb-10 text-center">
                    <Logo/>
                    <h1 className="mb-2 text-4xl font-bold bg-linear-to-r from-neutral-900 via-neutral-800 to-neutral-900 bg-clip-text text-transparent">
                        AffiliateTracker
                    </h1>
                    <p className="text-base text-neutral-600 font-medium">Track your affiliate performance</p>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMode}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={cardVariants}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden">
                            {/* Gradient Header */}
                            <div className="h-1 bg-linear-to-r from-primary-500 via-accent-500 to-secondary-500" />

                            <CardHeader className="space-y-3 px-8 pt-8 pb-6 bg-linear-to-b from-neutral-50/50 to-transparent">
                                <CardTitle className="text-3xl font-bold tracking-tight bg-linear-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                                    {currentMode === "login" && "Welcome Back"}
                                    {currentMode === "register" && "Create Account"}
                                    {currentMode === "forgot-password" && "Reset Password"}
                                </CardTitle>
                                <CardDescription className="text-base text-neutral-600 font-medium">
                                    {currentMode === "login" && "Sign in to continue to your dashboard"}
                                    {currentMode === "register" && "Create a new account to get started"}
                                    {currentMode === "forgot-password" && "Enter your email and we'll send you a reset link"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 bg-white/40 backdrop-blur-sm">
                                {/* Login Form */}
                                {currentMode === "login" && (
                                    <Form {...loginForm}>
                                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                                            <FormField
                                                control={loginForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your email"
                                                                variant="primary"
                                                                className="h-11"
                                                                disabled={loading}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={loginForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Password</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Enter your password"
                                                                    variant="primary"
                                                                    className="h-11 pr-10"
                                                                    disabled={loading}
                                                                    {...field}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                                >
                                                                    {showPassword ? <FaEyeSlash className="size-5" /> : <FaEye className="size-5" />}
                                                                </button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex items-center justify-between">
                                                <FormField
                                                    control={loginForm.control}
                                                    name="rememberMe"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                                                            </FormControl>
                                                            <FormLabel className="cursor-pointer text-sm font-normal text-muted-foreground mt-0!">
                                                                Remember me
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleModeChange("forgot-password")}
                                                    className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                                                >
                                                    Forgot Password?
                                                </button>
                                            </div>

                                            <Button
                                                type="submit"
                                                variant="primary"
                                                size="lg"
                                                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300"
                                                loading={loading}
                                                rightIcon={!loading ? FaArrowRight : undefined}
                                            >
                                                Sign In
                                            </Button>
                                        </form>
                                    </Form>
                                )}

                                {/* Register Form */}
                                {currentMode === "register" && (
                                    <Form {...registerForm}>
                                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                                            <FormField
                                                control={registerForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your email"
                                                                variant="primary"
                                                                className="h-11"
                                                                disabled={loading}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={registerForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Password</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Create a password"
                                                                    variant="primary"
                                                                    className="h-11 pr-10"
                                                                    disabled={loading}
                                                                    {...field}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                                >
                                                                    {showPassword ? <FaEyeSlash className="size-5" /> : <FaEye className="size-5" />}
                                                                </button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={registerForm.control}
                                                name="confirmPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Confirm Password</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder="Confirm your password"
                                                                    variant="primary"
                                                                    className="h-11 pr-10"
                                                                    disabled={loading}
                                                                    {...field}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                                >
                                                                    {showConfirmPassword ? (
                                                                        <FaEyeSlash className="size-5" />
                                                                    ) : (
                                                                        <FaEye className="size-5" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={registerForm.control}
                                                name="acceptTerms"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-start space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="cursor-pointer text-sm font-normal leading-none mt-0!">
                                                            I accept the Terms and Conditions
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                type="submit"
                                                variant="primary"
                                                size="lg"
                                                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300"
                                                loading={loading}
                                                rightIcon={!loading ? FaArrowRight : undefined}
                                            >
                                                Create Account
                                            </Button>
                                        </form>
                                    </Form>
                                )}

                                {/* Forgot Password Form */}
                                {currentMode === "forgot-password" && (
                                    <Form {...forgotPasswordForm}>
                                        <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-5">
                                            <FormField
                                                control={forgotPasswordForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold">Email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your email"
                                                                variant="primary"
                                                                className="h-11"
                                                                disabled={loading}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                type="submit"
                                                variant="primary"
                                                size="lg"
                                                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300"
                                                loading={loading}
                                                rightIcon={!loading ? FaArrowRight : undefined}
                                            >
                                                Send Reset Link
                                            </Button>
                                        </form>
                                    </Form>
                                )}

                                {/* Social Login Buttons - Login and Register only */}
                                {(currentMode === "login" || currentMode === "register") && (
                                    <>
                                        <div className="my-8 flex items-center">
                                            <div className="flex-1 border-t border-neutral-200/50" />
                                            <span className="px-4 text-sm font-medium text-neutral-500 bg-white/50 backdrop-blur-sm rounded-full py-1">
                                                or continue with
                                            </span>
                                            <div className="flex-1 border-t border-neutral-200/50" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="lg"
                                                className="h-14 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 transition-all duration-200 group"
                                                onClick={handleGoogleSignIn}
                                                loading={loading}
                                            >
                                                <FcGoogle className="size-7 group-hover:scale-110 transition-transform duration-200" />
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="lg"
                                                className="h-14 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 transition-all duration-200 group"
                                                onClick={handleFacebookSignIn}
                                                loading={loading}
                                            >
                                                <FaFacebook className="size-6 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {/* Mode Switching Links */}
                                <div className="mt-6 text-center text-sm border-t border-neutral-200 pt-6">
                                    {currentMode === "login" && (
                                        <p className="text-neutral-600">
                                            Don't have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => handleModeChange("register")}
                                                className="font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                                            >
                                                Sign Up
                                            </button>
                                        </p>
                                    )}
                                    {currentMode === "register" && (
                                        <p className="text-neutral-600">
                                            Already have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => handleModeChange("login")}
                                                className="font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                                            >
                                                Sign In
                                            </button>
                                        </p>
                                    )}
                                    {currentMode === "forgot-password" && (
                                        <p className="text-neutral-600">
                                            Remembered your password?{" "}
                                            <button
                                                type="button"
                                                onClick={() => handleModeChange("login")}
                                                className="font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                                            >
                                                Back to Sign In
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
