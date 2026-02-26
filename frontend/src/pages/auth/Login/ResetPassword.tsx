import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import api from "@/api/axios";
import { useMessageStore } from "@/store/useMessageStore";
import { useAuthStore } from "@/store/useAuthStore";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";

const ResetPassword = () => {
    const { token } = useParams<{ token: string }>();
    const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { addMessage } = useMessageStore();
    const { authSuccess } = useAuthStore();

    const handleInputChange = (value: string, name: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return addMessage({ type: "error", text: "Passwords do not match!" });
        }

        setLoading(true);
        try {
            const { data } = await api.patch(`/auth/reset-password/${token}`, {
                password: formData.password
            });

            authSuccess(data.data.user);
            addMessage({ type: "success", text: "Password reset successfully! You are now logged in." });
            navigate("/");
        } catch (err: any) {
            addMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to reset password. Link may be expired.",
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                <div className="flex flex-col gap-2 mb-10 text-center relative z-10">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                        <ShieldCheck className="text-blue-600 w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight italic flex items-center justify-center gap-2">
                        Reset <span className="text-blue-600">Password</span>
                    </h1>
                    <p className="text-slate-500 font-medium px-4 text-sm">Please choose a new strong password to secure your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                    <FormInput
                        type="password"
                        id="password"
                        name="password"
                        label="New Password"
                        value={formData.password}
                        placeholder="••••••••"
                        icon={<Lock size={18} />}
                        onChange={handleInputChange}
                    />
                    <FormInput
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm New Password"
                        value={formData.confirmPassword}
                        placeholder="••••••••"
                        icon={<Lock size={18} />}
                        onChange={handleInputChange}
                    />

                    <Button
                        type="submit"
                        isLoading={loading}
                        className="py-5 text-lg shadow-blue-500/20 mt-4"
                        icon={<ArrowRight size={20} />}
                    >
                        Update Password
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
