import React from "react";
import SmartDropdown from "../../../../components/SmartDropdown";
import type { Option } from "../../../NewBillingEntry/constants";

interface DetailField {
  label: string;
  value?: string | number | null;
  key?: string;
  isEditable?: boolean;
  options?: Option[];
}

interface DetailBlockProps {
  title: string;
  icon?: React.ReactNode;
  fields: DetailField[];
  onChange?: (key: string, value: string) => void;
  isEditMode?: boolean;
  emptyValue?: string;
  childs?: React.ReactNode;
}

const DetailBlock = ({
  title,
  icon,
  fields,
  onChange,
  isEditMode = false,
  emptyValue = "----------",
  childs,
}: DetailBlockProps) => {
  const handleChange = (key: string | undefined, value: string) => {
    if (key && onChange) onChange(key, value);
  };

  const isDateField = (label: string) => label.toLowerCase().includes("date");

  return (
    <div className="card-premium h-full flex flex-col gap-6 overflow-hidden">
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
                      mode="select"
                      name={f.key || ""}
                      value={String(f.value) || ""}
                      onChange={(val: string) => handleChange(f.key, val)}
                    />
                  </div>
                ) : (
                  <input
                    type={isDateField(f.label || "") ? "date" : "text"}
                    className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300"
                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                    value={
                      isDateField(f.label || "")
                        ? f.value
                          ? new Date(f.value).toISOString().split("T")[0]
                          : ""
                        : f.value === null
                          ? ""
                          : f.value ?? ""
                    }
                    onChange={(e) => handleChange(f.key, e.target.value)}
                  />
                )
              ) : (
                <div className="text-sm font-bold text-slate-700 min-h-[1.25rem] py-1 border-b border-slate-100/50">
                  {f.value ?? <span className="text-slate-300 font-medium italic">{emptyValue}</span>}
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

