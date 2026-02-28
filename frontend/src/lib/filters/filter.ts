export type FilterType = "sort" | "greater" | "less" | "range" | "text" | "month";

export type SortDirection = "asc" | "desc";

export interface FilterConfig<T> {
    field: keyof T | string;
    type: FilterType;
    label: string;
}

export type AppliedFilters<_T> = Partial<Record<string, unknown>>;

export type FilterWithValue<T> = FilterConfig<T> & { value: string | [string, string] | SortDirection };