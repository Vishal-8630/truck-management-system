import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, Contact } from "lucide-react";
import { motion } from "framer-motion";

import { type AppDispatch } from "../../app/store";
import { authStart, authSuccess, authEnd } from "../../features/auth";
import { addMessage } from "../../features/message";
import {
  selectAuthLoading,
} from "../../features/auth/authSelectors";

import api from "../../api/axios";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";

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
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectAuthLoading);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authStart());

    try {
      const { data } = await api.post("/auth/register", formData);
      dispatch(authSuccess(data.data.user));
      dispatch(
        addMessage({
          type: "success",
          text: data.message || "Registration successful",
        })
      );
      navigate("/");
    } catch (err: any) {
      const errors = err.response?.data?.errors || {};
      setFormErrors(errors);
      dispatch(authEnd());
      dispatch(
        addMessage({
          type: "error",
          text: err.response?.data?.message || "Registration failed",
        })
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent)] min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-premium border border-slate-100"
      >
        <div className="flex flex-col gap-2 mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight italic">Join Us</h1>
          <p className="text-slate-500 font-medium">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            text="Create Account"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="py-4 text-lg mt-4"
          />

          <div className="mt-8 text-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
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

