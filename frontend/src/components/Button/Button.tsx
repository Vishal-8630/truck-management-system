import React from "react";
import { motion } from "framer-motion";


interface ButtonProps {
  type?: "button" | "submit" | "reset";
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
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
  icon,
}) => {
  const baseClasses = "flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed";
  const variantClasses = variant === "primary" ? "btn-primary" : "btn-secondary";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${className} w-full`}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingText}
        </div>
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          {text}
        </>
      )}
    </motion.button>
  );
};

export default Button;


