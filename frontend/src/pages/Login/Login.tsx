import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Lock } from "lucide-react";
import { motion } from "framer-motion";

import { type AppDispatch } from "../../app/store";
import { authStart, authSuccess, authEnd } from "../../features/auth";
import { addMessage } from "../../features/message";
import {
  selectAuthLoading,
  selectUser,
} from "../../features/auth/authSelectors";

import api from "../../api/axios";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";

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

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectAuthLoading);
  const user = useSelector(selectUser);

  if (user) return <Navigate to="/" replace />;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

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
    dispatch(authStart());

    try {
      const { data } = await api.post("/auth/login", formData);
      dispatch(authSuccess(data.data.user));
      dispatch(
        addMessage({
          type: "success",
          text: data.message || "Login successful",
        })
      );
      resetForm();
      navigate("/");
    } catch (err: any) {
      const errors = err.response?.data?.errors || {};
      setFormErrors({
        username: errors.username || "",
        password: errors.password || "",
      });
      dispatch(authEnd());
      dispatch(
        addMessage({
          type: "error",
          text: err.response?.data?.message || "Login failed",
        })
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.05),transparent)] min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-premium border border-slate-100"
      >
        <div className="flex flex-col gap-2 mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight italic">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Please enter your details to login</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
              />
              <span className="text-sm text-slate-500 font-medium group-hover:text-indigo-600 transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-sm text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Forgot Password?</a>
          </div>

          <Button
            type="submit"
            text="Sign In"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="py-4 text-lg"
          />
        </form>
      </motion.div>
    </div>
  );
};

export default Login;

