import React from "react";
import SmartDropdown from "../../../../components/SmartDropdown";
import type { Option } from "../../../../types/form";

interface DetailField {
  label: string;
  value?: string | number | boolean | null;
  key?: string;
  isEditable?: boolean;
  options?: Option[];
  mode?: "select" | "search";
  fetchOptions?: (query: string, field: string) => Option[];
}

interface DetailBlockProps {
  title: string;
  icon?: React.ReactNode;
  fields: DetailField[];
  onChange?: (key: string, value: string, name?: string, mode?: "select" | "search") => void;
  isEditMode?: boolean;
  emptyValue?: string;
  childs?: React.ReactNode;
  errors?: Record<string, string>;
}

const DetailBlock = ({
  title,
  icon,
  fields,
  onChange,
  isEditMode = false,
  emptyValue = "----------",
  childs,
  errors = {},
}: DetailBlockProps) => {
  const handleChange = (key: string | undefined, value: string, name?: string, mode?: "select" | "search") => {
    if (key && onChange) onChange(key, value, name, mode);
  };

  const isDateField = (label: string) => label.toLowerCase().includes("date");

  return (
    <div className="card-premium h-full flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-2">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
          {icon && <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">{icon}</span>}
          {title}
        </h2>
        {isEditMode && (
          <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
        )}
      </div>

      {!childs ? (
        <div className="grid gap-x-8 gap-y-5">
          {fields.map((f, i) => (
            <div className="flex flex-col gap-1.5" key={i}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{f.label}</span>

              {isEditMode && f.isEditable ? (
                f?.options?.length ? (
                  <div className="mt-1">
                    <SmartDropdown
                      options={f.options}
                      mode={f.mode || "select"}
                      name={f.key || ""}
                      value={f.value ?? ""}
                      fetchOptions={f.fetchOptions || ((query: string) => {
                        return (f.options || []).filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
                      })}
                      onChange={(val: string, name: string, mode: "select" | "search") => {
                        if (f.key && onChange) onChange(f.key, val, name, mode);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <input
                      type={isDateField(f.label || "") ? "date" : "text"}
                      data-error={!!(f.key && errors[f.key])}
                      className={`w-full px-4 py-2 bg-white border rounded-xl text-sm font-bold transition-all placeholder:text-slate-300 focus:outline-none focus:ring-4 
                        ${f.key && errors[f.key]
                          ? "border-red-500 text-red-600 focus:ring-red-50 ring-2 ring-red-200"
                          : "border-indigo-100 text-slate-700 focus:ring-indigo-50"}`}
                      placeholder={`Enter ${f.label.toLowerCase()}...`}
                      value={
                        isDateField(f.label || "")
                          ? (() => {
                            if (!f.value || typeof f.value === "boolean") return "";
                            const date = new Date(f.value);
                            return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
                          })()
                          : f.value === null
                            ? ""
                            : String(f.value ?? "")
                      }
                      onChange={(e) => handleChange(f.key, e.target.value)}
                    />
                    {f.key && errors[f.key] && (
                      <span className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                        {errors[f.key]}
                      </span>
                    )}
                  </>
                )
              ) : (
                <div className="text-sm font-bold text-slate-700 min-h-[1.25rem] py-1 border-b border-slate-100/50">
                  {typeof f.value === "boolean"
                    ? (f.value ? "Completed" : "Active")
                    : (f.value ?? <span className="text-slate-300 font-medium italic">{emptyValue}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1">{childs}</div>
      )}
    </div>
  );
};

export default DetailBlock;
