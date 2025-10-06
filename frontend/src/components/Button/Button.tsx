import React from "react";
import styles from "./Button.module.scss";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  text,
  onClick,
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  className = "",
  variant = "primary",
}) => {
  const variantClass = variant === "primary" ? "primaryBtn" : "secondaryBtn";
  const stylesWithClassName = `${styles[variantClass]} ${className}`;

  return (
    <div className={styles.buttonContainer}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={stylesWithClassName}
      >
        {loading ? loadingText : text}
      </button>
    </div>
  );
};

export default Button;
