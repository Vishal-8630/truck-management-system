import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import SmartDropdown from "../SmartDropdown";
import {
  filterAddress,
  filterNumber,
  filterText,
} from "../../utils/filterInput";

type Option = { label: string; value: string };

interface FormInputProps {
  type: string;
  label: string;
  id: string;
  name: string;
  value: string;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  options?: Option[];
  selectMode?: "select" | "search";
  inputType?: string;
  inputRef?:
  | React.RefObject<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
  | undefined;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onSelectChange?: (
    val: string,
    name: string,
    mode: "select" | "search"
  ) => void;
  fetchOptions?: (val: string, field: string) => Option[];
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
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const isTextarea = type === "textarea";
  const isSelect = type === "select" || type === "search";
  const hasIcon = !!icon;

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

    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: val }
    } as React.ChangeEvent<any>;

    onChange(syntheticEvent);
  };

  return (
    <div className="flex flex-col gap-1.5 mb-4 group">
      <label
        htmlFor={id}
        className={`text-sm font-semibold transition-colors duration-200 ${error ? 'text-red-500' : isFocused ? 'text-indigo-600' : 'text-slate-700'}`}
      >
        {label}
      </label>

      {isSelect ? (
        <SmartDropdown
          id={id}
          name={name}
          value={value}
          mode={selectMode}
          options={options}
          placeholder={placeholder}
          inputRef={inputRef}
          onChange={(val, name, mode) => onSelectChange?.(val, name, mode)}
          fetchOptions={
            fetchOptions ? (val, field) => fetchOptions(val, field) : () => []
          }
        />
      ) : (
        <div className="relative flex items-center">
          {icon && (
            <span className={`absolute left-3.5 z-10 transition-colors duration-200 ${isFocused ? 'text-indigo-600' : 'text-slate-400'}`}>
              {icon}
            </span>
          )}

          {isTextarea ? (
            <textarea
              id={id}
              name={name}
              value={value}
              placeholder={placeholder}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`input-field min-h-[100px] resize-y ${hasIcon ? 'pl-11' : ''} ${error ? 'border-red-300 ring-red-50' : ''}`}
            />
          ) : (
            <input
              type={isPassword ? (showPassword ? "text" : "password") : type}
              id={id}
              name={name}
              value={value}
              placeholder={placeholder}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`input-field ${hasIcon ? 'pl-11' : ''} ${isPassword ? 'pr-11' : ''} ${error ? 'border-red-300 ring-red-50' : ''}`}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
            />
          )}

          {isPassword && (
            <button
              type="button"
              className="absolute right-3.5 text-slate-400 hover:text-indigo-600 transition-colors duration-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;

