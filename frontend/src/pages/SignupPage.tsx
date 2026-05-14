import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { SignupPayload } from "../types/auth.types";
import { signupUser } from "../services/api";
import { Button, Input, Card } from "../components/UIComponents";
import { Mail, Lock, User, Phone, Stethoscope, Hash } from "lucide-react";

export default function SignupForm() {
    const navigate = useNavigate();
    const [formData, setFormData] =
        useState<SignupPayload>({
            fname: "",
            lname: "",
            email: "",
            password: "",
            role: "patient",
            phone: "",
            specialization: "",
            registrationNumber: "",
        });
    const [role, setRole] =
        useState<"patient" | "doctor">(
            "patient"
        );

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [errors, setErrors] =
        useState<
            Partial<
                Record<
                    keyof SignupPayload,
                    string
                >
            >
        >({});

    const handleRoleChange = (selectedRole: "patient" | "doctor") => {
        setRole(selectedRole);
        setFormData((prev) => ({
            ...prev,
            role: selectedRole,
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name as keyof SignupPayload]) {
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
                    keyof SignupPayload,
                    string
                >
            > = {};

        if (!formData.fname.trim()) {
            newErrors.fname = "First name is required";
        }

        if (!formData.lname.trim()) {
            newErrors.lname = "Last name is required";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Enter a valid email";
        }

        if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (role === "doctor") {
            if (!formData.specialization?.trim()) {
                newErrors.specialization = "Specialization is required";
            }

            if (!formData.registrationNumber?.trim()) {
                newErrors.registrationNumber = "Registration number is required";
            }
        }
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
            const response = await signupUser(formData);

            console.log(
                "Signup Success:",
                response
            );
            navigate("/login");
        } catch (error: any) {
            console.error(error);
            alert(error?.response?.data?.message || "Signup failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
                        <Stethoscope
                            size={16}
                            className="text-white"
                        />
                    </div>
                    <span className="text-xl font-semibold text-white">
                        EHR-System
                    </span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-slate-400 mb-8">Join the secure healthcare platform</p>

                <div className="flex gap-3 mb-6">
                    {(
                        ["patient", "doctor"] as const
                    ).map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() =>handleRoleChange(r)}
                            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all
                                ${
                                    role === r
                                        ? "border-teal-400/50 bg-teal-400/10 text-teal-300"
                                        : "border-white/[0.1] bg-white/[0.03] text-slate-400 hover:border-white/[0.2] hover:text-white"
                                }
                            `}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Input
                                label="First Name"
                                name="fname"
                                value={formData.fname}
                                onChange={handleChange}
                                placeholder="John"
                                leftIcon={<User size={14} />}
                            />
                            {errors.fname && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.fname}
                                </p>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Last Name"
                                name="lname"
                                value={formData.lname}
                                onChange={handleChange}
                                placeholder="Doe"
                                leftIcon={<User size={14} />}
                            />

                            {errors.lname && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.lname}
                                </p>
                            )}
                        </div>
                    </div>

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

                    <Input
                        label="Phone"
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        leftIcon={<Phone size={14} />}
                    />

                    {role === "doctor" && (
                        <Card className="p-4 space-y-4 border-teal-400/10 bg-teal-400/5">
                            <p className="text-xs text-teal-400 uppercase tracking-wider font-medium">
                                Doctor Details
                            </p>
                            <div>
                                <Input
                                    label="Specialization"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    placeholder="e.g. Cardiologist"
                                    leftIcon={<Stethoscope size={14} />}
                                />

                                {errors.specialization && (
                                    <p className="text-red-400 text-xs mt-1">
                                        {errors.specialization}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Input
                                    label="Medical Registration No."
                                    name="registrationNumber"
                                    value={formData.registrationNumber}
                                    onChange={handleChange}
                                    placeholder="MCI-XXXXX"
                                    leftIcon={<Hash size={14} />}
                                />

                                {errors.registrationNumber && (
                                    <p className="text-red-400 text-xs mt-1">
                                        {errors.registrationNumber}
                                    </p>
                                )}
                            </div>
                        </Card>
                    )}

                    <Button
                        type="submit"
                        loading={isSubmitting}
                        className="w-full justify-center"
                        size="lg"
                    >
                        {isSubmitting
                            ? "Creating account..."
                            : "Create account"}
                    </Button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-teal-400 hover:text-teal-300 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}