import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";

import api from "@/api/axios";
import { useMessageStore } from "@/store/useMessageStore";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addMessage } = useMessageStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return addMessage({ type: "error", text: "Please enter your email" });

        setLoading(true);
        try {
            const { data } = await api.post("/auth/forgot-password", { email });
            addMessage({ type: "success", text: data.message || "Reset link sent to your email!" });
            // Optionally navigate back to login or show a success state
        } catch (err: any) {
            addMessage({
                type: "error",
                text: err.response?.data?.message || "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.05),transparent)] min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-premium border border-slate-100 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mt-16 blur-2xl" />

                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Login
                </button>

                <div className="flex flex-col gap-2 mb-10 text-center relative z-10">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight italic flex items-center justify-center gap-2">
                        Forgot <span className="text-blue-600">Password?</span>
                    </h1>
                    <p className="text-slate-500 font-medium px-4 text-sm">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8 relative z-10">
                    <FormInput
                        type="email"
                        id="email"
                        name="email"
                        label="Email Address"
                        value={email}
                        placeholder="your@email.com"
                        icon={<Mail size={18} />}
                        onChange={(val) => setEmail(val)}
                    />

                    <Button
                        type="submit"
                        isLoading={loading}
                        className="py-5 text-lg shadow-blue-500/20"
                        icon={<Send size={20} />}
                    >
                        Send Reset Link
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
