import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import SmartDropdown from "@/components/ui/SmartDropdown";
import {
  filterAddress,
  filterNumber,
  filterText,
} from "@/utils/filterInput";

import type { Option } from "@/types/form";

interface FormInputProps {
  type: string;
  label: React.ReactNode;
  id?: string;
  name: string;
  value: string;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  options?: Option[];
  selectMode?: "select" | "search";
  inputType?: string;
  inputRef?:
  | React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  | undefined;
  onChange: (value: string, name: string) => void;
  onSelectChange?: (
    val: string,
    name: string,
    mode: "select" | "search"
  ) => void;
  fetchOptions?: (val: string, field: string) => Option[];
  className?: string;
  readOnly?: boolean;
  noResultsMessage?: string;
  helpText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  type,
  label,
  id,
  name,
  value,
  placeholder,
  error,
  icon,
  options = [],
  selectMode,
  inputType,
  inputRef,
  onChange,
  onSelectChange,
  fetchOptions,
  className,
  readOnly,
  noResultsMessage,
  helpText,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const isPassword = type === "password";
  const isTextarea = type === "textarea";
  const isSelect = type === "select" || type === "search";
  const hasIcon = !!icon;

  const inputId = id ?? name;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    let val = e.target.value;
    if (inputType === "number") {
      val = filterNumber(val);
    } else if (inputType === "text") {
      val = filterText(val);
    } else if (inputType === "address") {
      val = filterAddress(val);
    }
    setLocalValue(val);
    onChange(val, name);
  };

  return (
    <div className={`flex flex-col mb-5 ${className || ""}`}>
      <label
        htmlFor={inputId}
        className={`form-group-label transition-all duration-300 ${error
          ? "text-rose-500"
          : isFocused
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-600 dark:text-slate-400"
          }`}
      >
        {label}
      </label>

      {isSelect ? (
        <SmartDropdown
          id={inputId}
          name={name}
          value={value}
          mode={selectMode}
          options={options}
          placeholder={placeholder}
          inputRef={inputRef}
          onChange={(val, n, mode) => {
            onSelectChange?.(val, n, mode);
            setLocalValue(val);
            onChange(val, n);
          }}
          fetchOptions={
            fetchOptions ? (val, field) => fetchOptions(val, field) : () => []
          }
          noResultsMessage={noResultsMessage}
          error={error}
        />
      ) : (
        <div className="relative group/field">
          {icon && (
            <span
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${isFocused ? "text-blue-600 dark:text-blue-400 scale-110" : "text-slate-400 dark:text-slate-500 group-hover/field:text-slate-500 dark:group-hover/field:text-slate-400"
                }`}
            >
              {icon}
            </span>
          )}

          {isTextarea ? (
            <textarea
              id={inputId}
              name={name}
              value={localValue}
              placeholder={placeholder}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              readOnly={readOnly}
              ref={inputRef as any}
              className={`input-field min-h-[120px] resize-none ${hasIcon ? "pl-12" : ""
                } ${error ? "border-rose-200 dark:border-rose-900 focus:border-rose-50 dark:focus:border-rose-900" : ""} ${readOnly ? "bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-70" : ""}`}
            />
          ) : (
            <input
              type={isPassword ? (showPassword ? "text" : "password") : type}
              id={inputId}
              name={name}
              value={localValue}
              placeholder={placeholder}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              readOnly={readOnly}
              ref={inputRef as any}
              className={`input-field ${hasIcon ? "pl-12" : ""} ${isPassword ? "pr-12" : ""
                } ${error ? "border-rose-200 dark:border-rose-900 focus:border-rose-500 dark:focus:border-rose-900" : ""} ${readOnly ? "bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-70" : ""}`}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
            />
          )}

          {isPassword && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-all duration-200 p-1 rounded-lg hover:bg-slate-100"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] font-bold text-rose-500 mt-2 px-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
          <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
          {error}
        </p>
      )}

      {!error && helpText && (
        <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mt-2 px-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 italic opacity-80">
          <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormInput;
