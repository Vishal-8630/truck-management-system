import React, { useState, useEffect, useRef } from "react";
import styles from "./SmartDropdown.module.scss";
import { AnimatePresence, motion } from "framer-motion";

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
  fetchOptions?: (query: string) => Option[];
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
  const [data, setData] = useState<Option[]>(options);
  const [selected, setSelected] = useState<Option | null>(null);

  const ref = useRef<HTMLDivElement | null>(null);

  // Close on pointer/touch outside — more reliable than click in overlays
  useEffect(() => {
    const handlePointer = (e: Event) => {
      if (!ref.current) return;
      const target = e.target as Node | null;
      if (!target) return;
      if (!ref.current.contains(target)) {
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

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // keep "selected" in sync with external value
  useEffect(() => {
    if (!search) {
      if (value) {
        const match = data.find((opt) => opt.value === value);
        if (match) {
          setSelected(match);
          setSearch(match.label);
        } else {
          setSelected({ label: value, value });
        }
      } else {
        setSelected(null);
        setSearch("");
      }
    }
  }, [value, data]);

  // fetch options dynamically in search mode OR sync data in select mode
  useEffect(() => {
    if (mode === "search" && fetchOptions && search.length > 0) {
      const timeout = setTimeout(() => {
        const fetchedOptions = fetchOptions(search);
        setData(fetchedOptions);
      }, 500);
      return () => clearTimeout(timeout);
    } else if (mode === "search" && search.length === 0) {
      setData([]);
    } else if (mode === "select") {
      setData(options);
    }
  }, [search, mode, fetchOptions, options]);

  /**
   * Handles selecting an option in the dropdown, whether from the select list or after searching.
   * @param {Option} opt - The selected option.
   * @param {"select"|"search"} mode - The mode of the dropdown.
   */
  const handleSelect = (opt: Option, mode: "select" | "search") => {
    setSelected(opt);
    onChange(opt.value, name, mode);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={styles.dropdown} ref={ref}>
      {label && <label>{label}</label>}

      {mode === "select" ? (
        <div
          className={styles.control}
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
          {selected ? selected.label : placeholder}
          <span className={styles.arrow}>▾</span>
        </div>
      ) : (
        <input
          id={id}
          name={name}
          type="text"
          className={styles.input}
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
      )}

      {open && (
        <AnimatePresence>
          {(data.length > 0 || data.length === 0) && (
            <motion.ul
              className={styles.menu}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {data.length === 0 ? (
                <li className={styles.menuEmpty}>No results</li>
              ) : (
                data.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => handleSelect(opt, mode)}
                    role="option"
                    tabIndex={0}
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
      )}
    </div>
  );
};

export default SmartDropdown;
