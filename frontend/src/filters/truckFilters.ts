import type { TruckType } from "@/types/truck";
import type { FilterConfig } from "@/filters/filter";

export const TruckFilters: FilterConfig<TruckType>[] = [
    { field: "truck_no", type: "text", label: "Truck Registration" },
    { field: "model", type: "text", label: "Model" },
];
