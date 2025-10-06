import type { FilterWithValue } from "./filter";
import getNestedValue from "./getNestedValue";

export function applyFilters<T>(data: T[], filters: FilterWithValue<T>[]): T[] {
  let result = [...data];

  for (const filter of filters) {
    const { field, type, value } = filter;
    if (!value) continue;

    result = result.filter((item) => {
      const fieldValue = getNestedValue(item, field as string);
      if (fieldValue == null) return false;

      switch (type) {
        case "month": {
          const year = new Date().getFullYear();
          const monthIndex = new Date(`${value} 1, ${year}`).getMonth();

          const startDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);
          const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

          const ts = new Date(fieldValue as string).getTime();
          const minTs = startDate.getTime();
          const maxTs = endDate.getTime();

          return ts >= minTs && ts <= maxTs;
        }

        case "text":
          return fieldValue
            .toString()
            .toLowerCase()
            .includes(value.toString().toLowerCase());

        case "greater": {
          // Check if fieldValue is a valid number
          const isFieldNumeric = !isNaN(Number(fieldValue));
          const isValueNumeric = !isNaN(Number(value));

          if (isFieldNumeric && isValueNumeric) {
            return Number(fieldValue) > Number(value);
          }

          // Otherwise treat as date
          const fieldDate = new Date(fieldValue as string).getTime();
          const filterDate = new Date(value as string).getTime();

          return fieldDate > filterDate;
        }

        case "less": {
          // Check if fieldValue is a valid number
          const isFieldNumeric = !isNaN(Number(fieldValue));
          const isValueNumeric = !isNaN(Number(value));

          if (isFieldNumeric && isValueNumeric) {
            return Number(fieldValue) < Number(value);
          }

          // Otherwise treat as date
          const fieldDate = new Date(fieldValue as string).getTime();
          const filterDate = new Date(value as string).getTime();

          return fieldDate < filterDate;
        }

        case "range": {
          // value is now [min, max]
          if (!Array.isArray(value)) return true;
          const [min, max] = value;

          if (!min && !max) return true;

          const isFieldNumeric = !isNaN(Number(fieldValue));
          const isMinNumeric = min ? !isNaN(Number(min)) : false;
          const isMaxNumeric = max ? !isNaN(Number(max)) : false;

          // If field and min/max are numeric, compare as numbers
          if (isFieldNumeric && (isMinNumeric || isMaxNumeric)) {
            const numField = Number(fieldValue);
            const numMin = min ? Number(min) : -Infinity;
            const numMax = max ? Number(max) : Infinity;
            return numField >= numMin && numField <= numMax;
          }

          // Otherwise treat as dates
          const ts = new Date(fieldValue as string).getTime();
          const minTs = min ? new Date(min as string).getTime() : -Infinity;
          const maxTs = max ? new Date(max as string).getTime() : Infinity;
          return ts >= minTs && ts <= maxTs;
        }

        default:
          return true;
      }
    });
  }

  // console.log(result);
  // Handle sort separately
  const sortFilter = filters.find((f) => f.type === "sort");
  if (sortFilter) {
    const { field, value } = sortFilter;
    const direction =
      (value as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    result.sort((a, b) => {
      const aVal = getNestedValue(a, field as string)?.toString() || "";
      const bVal = getNestedValue(b, field as string)?.toString() || "";

      return direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }
  return result;
}
