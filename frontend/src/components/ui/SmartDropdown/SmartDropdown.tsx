import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import type { Option } from "@/types/form";

interface Props {
  id?: string;
  name: string;
  label?: string;
  options?: Option[];
  mode?: "select" | "search";
  value?: string | boolean | number;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | undefined;
  fetchOptions?: (query: string, field: string) => Option[];
  onChange: (val: any, name: string, mode: "select" | "search") => void;
  error?: string;
  noResultsMessage?: string;
}

const SmartDropdown = ({
  id,
  name,
  label,
  options = [],
  mode = "select",
  value = "",
  placeholder = "Select...",
  inputRef,
  fetchOptions,
  onChange,
  error,
  noResultsMessage = "No results found",
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Option[]>([]);
  const [selected, setSelected] = useState<Option | null>(null);

  const ref = useRef<HTMLDivElement | null>(null);

  // Sync current selection with prop value
  useEffect(() => {
    const currentValue = selected?.value ?? "";
    const incomingValue = value ?? "";

    if (incomingValue !== currentValue) {
      const list = [...data, ...options];
      const match = list.find((opt) => opt.value === incomingValue);

      if (match) {
        setSelected(match);
        setSearch(match.label);
      } else if (incomingValue !== "") {
        const fallback = { label: String(incomingValue), value: incomingValue as any };
        setSelected(fallback);
        setSearch(String(incomingValue));
      } else {
        setSelected(null);
        setSearch("");
      }
    }
  }, [value, options, data, selected?.value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (mode === "search" && fetchOptions && open) {
      // If search is empty but input has a selected value, we might NOT want to show everything?
      // Actually, user wants to see "3 or 4 newly added entries" when they CLICK (open).
      const timeout = setTimeout(() => {
        const fetched = fetchOptions(search, name);
        setData((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(fetched)) return prev;
          return fetched;
        });
      }, search.length > 0 ? 300 : 0); // Immediate fetch if empty (on click)
      return () => clearTimeout(timeout);
    }
  }, [search, mode, fetchOptions, name, open]);

  const displayData = mode === "select" ? options : data;

  const handleSelect = (opt: Option, mode: "select" | "search") => {
    setSelected(opt);
    setSearch(opt.label);
    onChange(opt.value, name, mode);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}

      {mode === "select" ? (
        <div
          className={`input-field cursor-pointer flex items-center justify-between gap-2 ${error ? "border-red-500 bg-red-50/10 dark:bg-red-900/10" : open ? "border-blue-500 ring-4 ring-blue-100/50 dark:ring-blue-900/20" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          role="button"
          tabIndex={0}
          ref={inputRef as any}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setOpen((p) => !p);
          }}
        >
          <span className={`truncate ${!selected ? 'text-slate-400' : 'text-slate-900 font-medium'}`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-blue-500" : ""}`} />
        </div>
      ) : (
        <div className="relative flex items-center">
          <input
            id={id}
            name={name}
            type="text"
            className={`input-field pr-10 ${error ? "border-red-500 bg-red-50/10 dark:bg-red-900/10" : open ? "border-blue-500 ring-4 ring-blue-100/50 dark:ring-blue-900/20" : ""}`}
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              if (val === "") {
                setSelected(null);
                onChange("", name, "search");
              }
            }}
            placeholder={placeholder}
            ref={inputRef as React.RefObject<HTMLInputElement>}
            onFocus={() => setOpen(true)}
          />
          <ChevronDown className={`absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none transition-transform duration-200 ${open ? "rotate-180 text-blue-500" : ""}`} />
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[9999] w-full mt-2 rounded-2xl max-h-[320px] overflow-y-auto p-2"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-default)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {displayData.length === 0 ? (
              <li className="p-4 text-center text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{noResultsMessage}</li>
            ) : (
              displayData.map((opt) => (
                <li
                  key={String(opt.value)}
                  onClick={() => handleSelect(opt, mode)}
                  role="option"
                  tabIndex={0}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: selected?.value === opt.value ? 'var(--color-accent-soft)' : undefined,
                    color: selected?.value === opt.value ? 'var(--color-accent-text)' : 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={e => { if (selected?.value !== opt.value) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-raised)'; }}
                  onMouseLeave={e => { if (selected?.value !== opt.value) (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
                  onKeyDown={(e) => e.key === "Enter" && handleSelect(opt, mode)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Error message removed since FormInput handles it */}
    </div>
  );
};

export default SmartDropdown;

