import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type Option = { label: string; value: string };

interface Props {
  id?: string;
  name: string;
  label?: string;
  options?: Option[];
  mode?: "select" | "search";
  value?: string;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | undefined;
  fetchOptions?: (query: string, field: string) => Option[];
  onChange: (val: string, name: string, mode: "select" | "search") => void;
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
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Option[]>([]);
  const [selected, setSelected] = useState<Option | null>(null);

  const ref = useRef<HTMLDivElement | null>(null);

  // Sync current selection with prop value
  useEffect(() => {
    // We only sync if value actually changes relative to our selected state
    if (value !== (selected?.value ?? "")) {
      const list = mode === "select" ? options : data;
      const match = list.find((opt) => opt.value === value);

      if (match) {
        setSelected(match);
        setSearch(match.label);
      } else if (value) {
        setSelected({ label: value, value });
        setSearch(value);
      } else {
        setSelected(null);
        setSearch("");
      }
    }
  }, [value, mode, options, data, selected?.value]); // only depend on selected.value

  useEffect(() => {
    const handlePointer = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer, true);
    document.addEventListener("touchstart", handlePointer, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointer, true);
      document.removeEventListener("touchstart", handlePointer, true);
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
    if (mode === "search" && fetchOptions && search.length > 0 && open) {
      const timeout = setTimeout(() => {
        const fetched = fetchOptions(search, name);
        // Only update if data is different
        setData((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(fetched)) return prev;
          return fetched;
        });
      }, 300);
      return () => clearTimeout(timeout);
    } else if (mode === "search" && search.length === 0 && data.length > 0) {
      setData([]);
    }
  }, [search, mode, fetchOptions, name, open, data.length]);

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
          className={`input-field cursor-pointer flex items-center justify-between gap-2 ${open ? "border-blue-500 ring-4 ring-blue-100/50" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          role="button"
          tabIndex={0}
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
            className={`input-field pr-10 ${open ? "border-blue-500 ring-4 ring-blue-100/50" : ""}`}
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
            className="absolute z-[9999] w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl max-h-[320px] overflow-y-auto p-2"
          >
            {displayData.length === 0 ? (
              <li className="p-4 text-center text-slate-400 text-sm font-medium">No results found</li>
            ) : (
              displayData.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt, mode)}
                  role="option"
                  tabIndex={0}
                  className={`
                    px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                    ${selected?.value === opt.value
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"}
                  `}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSelect(opt, mode)
                  }
                >
                  {opt.label}
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartDropdown;

