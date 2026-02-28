import { useState, useMemo } from "react";
import type { FilterConfig, AppliedFilters } from "@/filters/filter";
import SmartDropdown from "@/components/SmartDropdown";
import type { Option } from "@/pages/bills/NewBillingEntry/constants";

type Props<T> = {
  filters: FilterConfig<T>[];
  onApply: (values: AppliedFilters<T>) => void;
  onCancel: () => void;
};

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const GenericFilter = <T,>({ filters, onApply, onCancel }: Props<T>) => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const monthOptions: Option[] = useMemo(() => MONTHS.map((month) => ({
    label: month.charAt(0).toUpperCase() + month.slice(1).toLowerCase(),
    value: month,
  })), []);

  const handleChange = (field: string, value: any, type?: string) => {
    const key = type ? `${field}$${type}` : field;
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleRangeChange = (field: string, bound: "min" | "max", value: any) => {
    setFilterValues((prev) => {
      const current: [any, any] = prev[field] ?? [undefined, undefined];
      const updated: [any, any] = bound === "min" ? [value, current[1]] : [current[0], value];
      return { ...prev, [field]: updated };
    });
  };

  const applyFilters = () => {
    onApply(filterValues);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-bold text-slate-900 italic">Choose Filters</h3>
        <p className="text-slate-500 text-sm font-medium">Refine your results with precision.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {filters.map((f, idx) => {
          if (f.type === "month") {
            return (
              <div key={idx}>
                <SmartDropdown
                  label={f.label}
                  name={f.field.toString()}
                  mode="select"
                  value={filterValues[`${f.field as string}$month`] || ""}
                  options={monthOptions}
                  placeholder="Select Month"
                  onChange={(val) => handleChange(f.field.toString(), val, "month")}
                />
              </div>
            );
          }

          if (f.type === "sort") {
            return (
              <div key={idx}>
                <SmartDropdown
                  label={f.label}
                  name={f.field.toString()}
                  mode="select"
                  value={filterValues[`${f.field as string}$sort`] || ""}
                  options={[
                    { label: "Default", value: "" },
                    { label: "Ascending", value: "asc" },
                    { label: "Descending", value: "desc" },
                  ]}
                  placeholder="Sort Order"
                  onChange={(val) => handleChange(f.field.toString(), val, "sort")}
                />
              </div>
            );
          }

          if (f.type === "greater" || f.type === "less") {
            return (
              <div key={idx} className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                <input
                  type="date"
                  className="input-field"
                  value={filterValues[`${f.field as string}$${f.type}`] || ""}
                  onChange={(e) => handleChange(f.field.toString(), e.target.value, f.type)}
                />
              </div>
            );
          }

          if (f.type === "range") {
            return (
              <div key={idx} className="flex flex-col gap-2 col-span-full">
                <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    className="input-field"
                    value={filterValues[`${f.field as string}$range`]?.[0] || ""}
                    onChange={(e) => handleRangeChange(`${f.field.toString()}$range`, "min", e.target.value)}
                  />
                  <input
                    type="date"
                    className="input-field"
                    value={filterValues[`${f.field as string}$range`]?.[1] || ""}
                    onChange={(e) => handleRangeChange(`${f.field.toString()}$range`, "max", e.target.value)}
                  />
                </div>
              </div>
            );
          }

          if (f.type === "text") {
            return (
              <div key={idx} className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                <input
                  type="text"
                  placeholder={`Filter by ${f.label.toLowerCase()}...`}
                  className="input-field"
                  value={filterValues[`${f.field as string}$text`] || ""}
                  onChange={(e) => handleChange(f.field.toString(), e.target.value, "text")}
                />
              </div>
            );
          }

          if (f.type === "select") {
            return (
              <div key={idx}>
                <SmartDropdown
                  label={f.label}
                  name={f.field.toString()}
                  mode="select"
                  value={filterValues[`${f.field as string}$select`] || ""}
                  options={f.options || []}
                  placeholder={`Select ${f.label}`}
                  onChange={(val) => handleChange(f.field.toString(), val, "select")}
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
        <button
          className="btn-primary flex-1 py-3"
          onClick={() => {
            applyFilters();
            onCancel();
          }}
        >
          Apply Filters
        </button>
        <button
          className="flex-1 py-3 px-6 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all duration-200"
          onClick={() => {
            setFilterValues({});
            onApply({});
            onCancel();
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default GenericFilter;

