import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaUser, FaEnvelope, FaLock, FaIdCard } from "react-icons/fa";

import { type AppDispatch } from "../../app/store";
import { authStart, authSuccess, authEnd } from "../../features/auth";
import { addMessage } from "../../features/message";
import {
  selectAuthLoading,
  selectUser,
} from "../../features/auth/authSelectors";

import api from "../../api/axios";
import FormSection from "../../components/FormSection";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";

import styles from "./Register.module.scss";

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
    placeholder: "Enter your full name",
    icon: <FaIdCard />,
  },
  {
    id: "email",
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email",
    icon: <FaEnvelope />,
  },
  {
    id: "username",
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "Choose a username",
    icon: <FaUser />,
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Set your password",
    icon: <FaLock />,
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
  const [showPassword, setShowPassword] = useState(false);

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

  const resetForm = () => {
    setFormData({ fullname: "", username: "", email: "", password: "" });
    setFormErrors({});
    setShowPassword(false);
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
      resetForm();
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
    <div className={styles.registerContainer}>
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <FormSection title="Register">
          {fields.map((field) => (
            <FormInput
              key={field.id}
              {...field}
              type={
                field.name === "password" && showPassword ? "text" : field.type
              }
              value={formData[field.name as keyof FormData]}
              error={formErrors[field.name as keyof FormErrors]}
              onChange={handleInputChange}
            />
          ))}
          
          <Button
            type="submit"
            text="Register"
            variant="primary"
            loading={loading}
            disabled={loading}
          />

          <p className={styles.footerText}>
            Already a user? <Link to="/login">Login</Link>
          </p>
        </FormSection>
      </form>
    </div>
  );
};

export default Register;
