import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  text?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  text,
  children,
  onClick,
  disabled = false,
  loading = false,
  isLoading = false,
  loadingText = "Processing...",
  className = "",
  variant = "primary",
  icon,
}) => {
  const isCurrentlyLoading = loading || isLoading;
  const baseClasses = "flex items-center justify-center gap-3 font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed";
  const variantClasses = variant === "primary" ? "btn-primary" : "btn-secondary";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isCurrentlyLoading}
      className={`${baseClasses} ${variantClasses} ${className} w-full`}
      whileHover={!disabled && !isCurrentlyLoading ? {
        y: -4,
        boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.4)"
      } : {}}
      whileTap={!disabled && !isCurrentlyLoading ? { scale: 0.98, y: 0 } : {}}
    >
      {isCurrentlyLoading ? (
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="italic tracking-widest uppercase text-xs font-black">{loadingText}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {icon && <span className="flex items-center">{icon}</span>}
          <span className="uppercase tracking-widest text-xs font-black">{children || text}</span>
        </div>
      )}

      {/* Shine effect on hover for primary button */}
      {variant === "primary" && !disabled && !isCurrentlyLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shine_1.5s_infinite] pointer-events-none" />
      )}
    </motion.button>
  );
};

export default Button;
