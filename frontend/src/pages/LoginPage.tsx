import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LoginPayload } from "../types/auth.types";
import { loginUser } from "../services/api";
import { Button, Input, Card } from "../components/UIComponents";
import { Mail, Lock, Stethoscope } from "lucide-react";

export default function LoginForm() {
    const navigate = useNavigate();
    const [formData, setFormData] =
        useState<LoginPayload>({
            email: "",
            password: "",
        });
    const [errors, setErrors] =
        useState<
            Partial<
                Record<
                    keyof LoginPayload,
                    string
                >
            >
        >({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name as keyof LoginPayload]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors:
            Partial<
                Record<
                    keyof LoginPayload,
                    string
                >
            > = {};
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email"

        if (!formData.password.trim()) newErrors.password = "Password is required";
        setErrors(newErrors);
        return (Object.keys(newErrors).length === 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        const isValid = validateForm();
        if (!isValid) return;
        try {
            setIsSubmitting(true);
            const response = await loginUser(formData);
            console.log("Login Success:", response);

            const role = response?.user?.role;
            if (role === "doctor") {
                navigate("/doctor/dashboard");
            }
            else if (role === "patient") {
                navigate("/patient/dashboard");
            }
            else {
                navigate("/");
            }
        } catch (error: any) {
            console.error(error);
            alert(
                error?.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
                        <Stethoscope size={16} className="text-white" />
                    </div>
                    <span className="text-xl font-semibold text-white">
                        EHR-System
                    </span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome Back
                </h1>
                <p className="text-slate-400 mb-8">
                    Login to your healthcare account
                </p>

                <Card className="p-6 bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                leftIcon={<Mail size={14} />}
                            />

                            {errors.email && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                leftIcon={<Lock size={14} />}
                            />

                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            loading={isSubmitting}
                            className="w-full justify-center"
                            size="lg"
                        >
                            {isSubmitting
                                ? "Signing in..."
                                : "Sign In"}
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-teal-400 hover:text-teal-300 transition-colors"
                    >
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
}