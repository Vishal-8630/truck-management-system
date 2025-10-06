type AnyObject = Record<string, any>;

/**
 * Build rows from any data and headers, excluding specified keys
 */
export function buildRows<T extends AnyObject>(
  entries: T[],
  headers: string[],
  excludeKeys: string[] = ["_id", "__v"]
): AnyObject[] {
  return entries.map((entry) => {
    const row: AnyObject = {};

    headers.forEach((headerKey) => {
      if (excludeKeys.some((ex) => headerKey.includes(ex))) return;

      const value = headerKey.split(".").reduce((acc, key) => {
        if (acc === undefined || acc === null) return "";
        const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
        if (arrayMatch) {
          const [, arrayKey, indexStr] = arrayMatch;
          const idx = parseInt(indexStr, 10);
          return acc[arrayKey]?.[idx];
        }
        return acc[key];
      }, entry);

      row[headerKey] = value !== undefined ? value : "";
    });

    return row;
  });
}

/**
 * Get ordered headers from any array of objects, excluding specified keys
 */
export function getOrderedHeaders<T extends AnyObject>(
  entries: T[],
  excludeKeys: string[] = ["_id", "__v"]
): string[] {
  if (!entries || entries.length === 0) return [];

  const headers = new Set<string>();

  entries.forEach((entry) => {
    const flattenObject = (obj: AnyObject, prefix = "") => {
      Object.keys(obj).forEach((key) => {
        if (excludeKeys.includes(key)) return;

        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "object" && item !== null) {
              flattenObject(item, `${newKey}[${index}]`);
            } else {
              headers.add(`${newKey}[${index}]`);
            }
          });
        } else if (typeof value === "object" && value !== null) {
          flattenObject(value, newKey);
        } else {
          headers.add(newKey);
        }
      });
    };

    flattenObject(entry);
  });

  return Array.from(headers);
}

/**
 * Get human-readable labels for headers
 */
export function getHeaderLabels(
  headers: string[],
  labelMap: Record<string, string> = {}
): string[] {
  return headers.map((key) => {
    if (labelMap[key]) return labelMap[key];

    const formatted = key
      .replace(/([A-Z])/g, " $1")       // camelCase -> spaces
      .replace(/_/g, " ")               // snake_case -> spaces
      .replace(/\./g, " > ")            // nested keys
      .replace(/\[(\d+)\]/g, " $1");    // array indices
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });
}