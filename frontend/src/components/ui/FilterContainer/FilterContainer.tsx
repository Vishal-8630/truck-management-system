import { useState, useMemo, useEffect } from "react";
import type { FilterConfig } from "@/filters/filter";
import { applyGenericFilters } from "@/filters/filerHelper";
import SmartDropdown from "@/components/SmartDropdown";
import type { Option } from "@/pages/bills/NewBillingEntry/constants";
import { Filter, X, RotateCcw } from "lucide-react";

type FilterContainerProps<T> = {
  data: T[];
  filters: FilterConfig<T>[];
  onFiltered: (results: T[]) => void;
};

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function FilterContainer<T>({ data, filters, onFiltered }: FilterContainerProps<T>) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [hasFilter, setHasFilter] = useState(false);

  const monthOptions: Option[] = useMemo(() =>
    MONTHS.map((month) => ({
      label: month.charAt(0).toUpperCase() + month.slice(1),
      value: month,
    })), []);

  // Auto-apply filters whenever filterValues changes
  useEffect(() => {
    const filterExists = Object.values(filterValues).some(
      (val) =>
        val !== null &&
        val !== "" &&
        !(Array.isArray(val) && val.every((v) => !v))
    );
    setHasFilter(filterExists);
    const result = filterExists ? applyGenericFilters(data, filterValues, filters) : data;
    onFiltered(result);
  }, [filterValues, data]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const clearAll = () => {
    setFilterValues({});
  };

  return (
    <div className="card-premium p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Filter size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filters</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refine your results</p>
          </div>
        </div>
        {hasFilter && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all"
          >
            <RotateCcw size={12} />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <div key={idx} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.label}</label>
                <input
                  type="date"
                  className="input-field text-sm"
                  value={filterValues[`${f.field as string}$${f.type}`] || ""}
                  onChange={(e) => handleChange(f.field.toString(), e.target.value, f.type)}
                />
              </div>
            );
          }

          if (f.type === "range") {
            return (
              <div key={idx} className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.label}</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className="input-field text-sm"
                    placeholder="From"
                    value={filterValues[`${f.field as string}$range`]?.[0] || ""}
                    onChange={(e) => handleRangeChange(`${f.field.toString()}$range`, "min", e.target.value)}
                  />
                  <input
                    type="date"
                    className="input-field text-sm"
                    placeholder="To"
                    value={filterValues[`${f.field as string}$range`]?.[1] || ""}
                    onChange={(e) => handleRangeChange(`${f.field.toString()}$range`, "max", e.target.value)}
                  />
                </div>
              </div>
            );
          }

          if (f.type === "text") {
            return (
              <div key={idx} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.label}</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search ${f.label.toLowerCase()}…`}
                    className="input-field text-sm pr-8"
                    value={filterValues[`${f.field as string}$text`] || ""}
                    onChange={(e) => handleChange(f.field.toString(), e.target.value, "text")}
                  />
                  {filterValues[`${f.field as string}$text`] && (
                    <button
                      onClick={() => handleChange(f.field.toString(), "", "text")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
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
                  placeholder={`All ${f.label}s`}
                  onChange={(val) => handleChange(f.field.toString(), val, "select")}
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Active Filter Pills */}
      {hasFilter && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active:</span>
          {Object.entries(filterValues).map(([key, val]) => {
            if (!val || val === "" || (Array.isArray(val) && val.every((v) => !v))) return null;
            const displayKey = key.split("$")[0];
            const displayVal = Array.isArray(val) ? val.filter(Boolean).join(" → ") : String(val);
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                {displayKey}: {displayVal}
                <button
                  onClick={() => {
                    setFilterValues((prev) => {
                      const next = { ...prev };
                      delete next[key];
                      return next;
                    });
                  }}
                  className="hover:text-blue-900"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FilterContainer;
