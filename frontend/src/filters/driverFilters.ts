import type { DriverType } from "@/types/driver";
import type { FilterConfig } from "@/filters/filter";

export const DriverFilters: FilterConfig<DriverType>[] = [
    { field: "name", type: "text", label: "Driver Name" },
    { field: "phone", type: "text", label: "Phone Number" },
    { field: "dl", type: "text", label: "DL Number" },
];
