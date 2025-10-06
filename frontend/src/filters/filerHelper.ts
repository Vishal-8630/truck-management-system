// src/helpers/filterHelpers.ts
import type {
  FilterConfig,
  FilterWithValue,
  SortDirection,
} from "../filters/filter";
import { applyFilters as baseApplyFilters } from "../filters/applyFilers";

/**
 * Flatten any filter values object to FilterWithValue<T>[]
 */
export const flattenFilters = <T>(
  filterValues: Record<string, any>,
  configs?: FilterConfig<T>[]
): FilterWithValue<T>[] => {
  return Object.entries(filterValues)
    .map(([field, value]): FilterWithValue<T> | null => {
      if (value == null || value === "") return null;
      // get config if provided
      const config = configs?.find((c) => c.field === field.split("$")[0] && c.type === field.split("$")[1]);
      const type = config?.type || "text";

      // handle range stored as [min, max]
      if (type === "range" && Array.isArray(value)) {
        const [min, max] = value;
        if (!min && !max) return null;
        return {
          field: field as keyof T,
          type: "range",
          label: config?.label || `${field} range`,
          value: [min || "", max || ""],
        };
      }

      // handle sort
      if (type === "sort") {
        return {
          field: field as keyof T,
          type: "sort",
          label: config?.label || field,
          value: (value as SortDirection) || "asc",
        };
      }

      // default: text, greater, less
      return {
        field: field as keyof T,
        type,
        label: config?.label || field,
        value: value.toString(),
      };
    })
    .filter(Boolean) as FilterWithValue<T>[];
};

/**
 * Apply filters generically
 */
export const applyGenericFilters = <T>(
  entries: T[],
  filterValues: Record<string, any>,
  configs?: FilterConfig<T>[]
) => {
  const activeFilters = flattenFilters<T>(filterValues, configs);
  return baseApplyFilters(entries, activeFilters as any);
};
