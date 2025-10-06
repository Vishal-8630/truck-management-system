import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaLock, FaUser } from "react-icons/fa";

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

import styles from "./Login.module.scss";

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
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <FormSection title="Login">
          <FormInput
            type="text"
            id="username"
            name="username"
            label="Username"
            value={formData.username}
            placeholder="Enter username"
            error={formErrors.username}
            icon={<FaUser />}
            onChange={handleInputChange}
          />
          <FormInput
            type="password"
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            placeholder="Enter password"
            error={formErrors.password}
            icon={<FaLock />}
            onChange={handleInputChange}
          />

          <div className={styles.formOptions}>
            <label>
              <input type="checkbox" /> Remember me
            </label>
          </div>

          <Button
            type="submit"
            text="Login"
            variant="primary"
            loading={loading}
            disabled={loading}
          />

          <p className={styles.footerText}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </FormSection>
      </form>
    </div>
  );
};

export default Login;
