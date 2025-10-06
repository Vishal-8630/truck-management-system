// src/components/GenericFilters.tsx
import { useState } from "react";
import type { FilterConfig, AppliedFilters } from "../../filters/filter";
import styles from "./GenericFilter.module.scss";
import SmartDropdown from "../SmartDropdown";
import type { Option } from "../../pages/NewBillingEntry/constants";

type Props<T> = {
  filters: FilterConfig<T>[];
  onApply: (values: AppliedFilters<T>) => void;
  onCancel: () => void;
};

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const GenericFilter = <T,>({ filters, onApply, onCancel }: Props<T>) => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const options: Option[] = MONTHS.map((month) => {
    return {
      label: month.charAt(0).toUpperCase() + month.slice(1).toLowerCase(),
      value: month,
    };
  });

  const handleChange = (field: string, value: any, type?: string) => {
    const key = type ? `${field}$${type}` : field;
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleRangeChange = (
    field: string,
    bound: "min" | "max",
    value: any
  ) => {
    setFilterValues((prev) => {
      const current: [any, any] = prev[field] ?? [undefined, undefined];
      const updated: [any, any] =
        bound === "min" ? [value, current[1]] : [current[0], value];

      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const applyFilters = () => {
    onApply(filterValues);
  };

  return (
    <div className={styles.genericFilterContainer}>
      <h3>Choose Filters</h3>
      <div className={styles.filterBody}>
        {filters.map((f, idx) => {
          if (f.type === "month") {
            return <div key={idx} className={styles.monthContainer}>
                <SmartDropdown
                  label={f.label}
                  name={f.field.toString()}
                  mode="select"
                  value={filterValues[`${f.field as string}$month`] || ""}
                  options={options}
                  placeholder="Select Month"
                  onChange={(val) =>
                    handleChange(f.field.toString(), val, "month")
                  }
                />
              </div>
          }

          if (f.type === "sort") {
            return (
              <div key={idx} className={styles.selectContainer}>
                <SmartDropdown
                  label={f.label}
                  name={f.field.toString()}
                  mode="select"
                  value={filterValues[`${f.field as string}$sort`] || ""}
                  options={[
                    { label: f.label, value: "" },
                    { label: "Ascending", value: "asc" },
                    { label: "Descending", value: "desc" },
                  ]}
                  placeholder="Sort By Date"
                  onChange={(val) =>
                    handleChange(f.field.toString(), val, "sort")
                  }
                />
              </div>
            );
          }

          if (f.type === "greater" || f.type === "less") {
            return (
              <div key={idx} className={styles.dateContainer}>
                <label>{f.label}</label>
                <input
                  type="date"
                  value={filterValues[`${f.field as string}$${f.type}`] || ""}
                  onChange={(e) =>
                    handleChange(f.field.toString(), e.target.value, f.type)
                  }
                />
              </div>
            );
          }

          if (f.type === "range") {
            return (
              <div key={idx} className={styles.rangeContainer}>
                <label>{f.label}</label>
                <div>
                  <input
                    type="date"
                    placeholder="From"
                    value={
                      filterValues[`${f.field as string}$range`]?.[0] || ""
                    }
                    onChange={(e) =>
                      handleRangeChange(
                        `${f.field.toString()}$range`,
                        "min",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="date"
                    placeholder="To"
                    value={
                      filterValues[`${f.field as string}$range`]?.[1] || ""
                    }
                    onChange={(e) =>
                      handleRangeChange(
                        `${f.field.toString()}$range`,
                        "max",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            );
          }

          if (f.type === "text") {
            return (
              <div key={idx} className={styles.textContainer}>
                <label>{f.label}</label>
                <input
                  type="text"
                  placeholder={f.label}
                  value={filterValues[`${f.field as string}$text`] || ""}
                  onChange={(e) =>
                    handleChange(f.field.toString(), e.target.value, "text")
                  }
                />
              </div>
            );
          }

          return null;
        })}
      </div>
      <div className={styles.filterControls}>
        <button
          onClick={() => {
            applyFilters();
            onCancel();
          }}
        >
          Apply
        </button>
        <button
          onClick={() => {
            setFilterValues({});
            onApply({});
            onCancel();
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default GenericFilter;
