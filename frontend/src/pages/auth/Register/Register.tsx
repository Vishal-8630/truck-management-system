import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Contact, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import { useAuthStore } from "@/store/useAuthStore";
import { useMessageStore } from "@/store/useMessageStore";

import api from "@/api/axios";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";

interface FormData {
  fullname: string;
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  fullname?: string;
  username?: string;
  email?: string;
  password?: string;
}

const fields = [
  {
    id: "fullname",
    name: "fullname",
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
    icon: <Contact size={18} />,
  },
  {
    id: "email",
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "john@example.com",
    icon: <Mail size={18} />,
  },
  {
    id: "username",
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "johndoe",
    icon: <User size={18} />,
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    icon: <Lock size={18} />,
  },
];

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const navigate = useNavigate();
  const { authStart, authSuccess, authEnd, loading } = useAuthStore();
  const { addMessage } = useMessageStore();

  const handleInputChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    authStart();

    try {
      const { data } = await api.post("/auth/register", formData);
      authSuccess(data.data.user);
      addMessage({
        type: "success",
        text: data.message || "Registration successful",
      });
      navigate("/");
    } catch (err: any) {
      const errors = err.response?.data?.errors || {};
      setFormErrors(errors);
      authEnd();
      addMessage({
        type: "error",
        text: err.response?.data?.message || "Registration failed",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.05),transparent)] min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-premium border border-slate-100 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full -ml-16 -mb-16 blur-2xl" />

        <div className="flex flex-col gap-2 mb-10 text-center relative z-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight italic">Join <span className="text-blue-600">Us</span></h1>
          <p className="text-slate-500 font-medium">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.slice(0, 2).map((field) => (
              <FormInput
                key={field.id}
                {...field}
                value={formData[field.name as keyof FormData]}
                error={formErrors[field.name as keyof FormErrors]}
                onChange={handleInputChange}
              />
            ))}
          </div>

          {fields.slice(2).map((field) => (
            <FormInput
              key={field.id}
              {...field}
              value={formData[field.name as keyof FormData]}
              error={formErrors[field.name as keyof FormErrors]}
              onChange={handleInputChange}
            />
          ))}

          <Button
            type="submit"
            isLoading={loading}
            className="py-5 text-lg mt-4 shadow-blue-500/20"
            icon={<ArrowLeft className="rotate-180" size={20} />}
          >
            Create Account
          </Button>

          <div className="mt-8 text-center bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline transition-all underline-offset-4">
                Log In
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
