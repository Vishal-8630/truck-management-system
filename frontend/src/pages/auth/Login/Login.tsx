import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useAuthStore } from "@/store/useAuthStore";
import { useMessageStore } from "@/store/useMessageStore";

import api from "@/api/axios";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username: string;
  password: string;
}


const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { authStart, authSuccess, authEnd, user, loading } = useAuthStore();
  const { addMessage } = useMessageStore();

  if (user) return <Navigate to="/" replace />;

  const handleInputChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({ username: "", password: "" });
    setFormErrors({ username: "", password: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    authStart();

    try {
      const { data } = await api.post("/auth/login", { ...formData, rememberMe });
      authSuccess(data.data.user);
      addMessage({
        type: "success",
        text: data.message || "Login successful",
      });
      resetForm();
      navigate("/");
    } catch (err: any) {
      const errors = err.response?.data?.errors || {};
      setFormErrors({
        username: errors.username || "",
        password: errors.password || "",
      });
      authEnd();
      addMessage({
        type: "error",
        text: err.response?.data?.message || "Login failed",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.05),transparent)] min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-premium border border-slate-100 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mb-16 blur-2xl" />

        <div className="flex flex-col gap-2 mb-10 text-center relative z-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight italic flex items-center justify-center gap-2">
            Welcome <span className="text-blue-600">Back</span>
          </h1>
          <p className="text-slate-500 font-medium">Please enter your details to login</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
          <FormInput
            type="text"
            id="username"
            name="username"
            label="Username"
            value={formData.username}
            placeholder="admin"
            error={formErrors.username}
            icon={<User size={18} />}
            onChange={handleInputChange}
          />
          <FormInput
            type="password"
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            placeholder="••••••••"
            error={formErrors.password}
            icon={<Lock size={18} />}
            onChange={handleInputChange}
          />

          <div className="flex items-center justify-between mb-2 px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className="text-xs text-slate-500 font-bold group-hover:text-blue-600 transition-colors uppercase tracking-widest">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-blue-600 font-black hover:underline underline-offset-4 uppercase tracking-widest"
            >
              Forgot?
            </button>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="py-5 text-lg shadow-blue-500/20"
            icon={<ArrowRight size={20} />}
          >
            Sign In
          </Button>

        </form>
      </motion.div>
    </div>
  );
};

export default Login;
