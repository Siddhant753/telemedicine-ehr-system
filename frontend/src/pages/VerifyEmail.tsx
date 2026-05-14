import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, MailCheck, Stethoscope } from "lucide-react";
import { verifyEmail } from "../services/api";
import { Button, Card } from "../components/UIComponents";

type VerifyStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<VerifyStatus>("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyUserEmail = async () => {
            try {
                if (!token) {
                    setStatus("error");
                    setMessage("Invalid verification link");
                    return;
                }
                const response = await verifyEmail(token);
                setStatus("success");
                setMessage(response?.message || "Email verified successfully");

                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } catch (error: any) {
                console.error(error);
                setStatus("error");
                setMessage(
                    error?.response?.data?.message ||
                    "Verification failed or link expired"
                );
            }
        };
        verifyUserEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
                        <Stethoscope size={18} className="text-white" />
                    </div>
                    <span className="text-2xl font-semibold text-white">
                        EHR-System
                    </span>
                </div>

                <Card className="p-8 bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm text-center">
                    {status === "loading" && (
                        <>
                            <div className="flex justify-center mb-5">
                                <div className="w-20 h-20 rounded-full bg-teal-400/10 flex items-center justify-center">
                                    <Loader2 size={36} className="text-teal-400 animate-spin" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Verifying Email
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Please wait while we verify your email...
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="flex justify-center mb-5">
                                <div className="w-20 h-20 rounded-full bg-emerald-400/10 flex items-center justify-center">
                                    <CheckCircle2 size={42} className="text-emerald-400" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Email Verified
                            </h1>
                            <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                {message}
                            </p>
                            <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
                                    <MailCheck size={16} />
                                    Redirecting to login...
                                </div>
                            </div>
                            <Button 
                                onClick={() => navigate("/login")}
                                className="w-full justify-center"
                                size="lg"
                            >
                                Continue to Login
                            </Button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="flex justify-center mb-5">
                                <div className="w-20 h-20 rounded-full bg-red-400/10 flex items-center justify-center">
                                    <XCircle size={42} className="text-red-400" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Verification Failed
                            </h1>
                            <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                {message}
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => navigate("/signup")}
                                    className="w-full justify-center"
                                    size="lg"
                                >
                                    Create Account Again
                                </Button>
                                
                                <Link
                                    to="/login"
                                    className="block text-sm text-teal-400 hover:text-teal-300 transition-colors"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}