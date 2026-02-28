import type { JourneyType } from "@/types/journey";
import type { FilterConfig } from "@/filters/filter";

export const JourneyFilters: FilterConfig<JourneyType>[] = [
    { field: "journey_start_date", type: "month", label: "Select Month" },
    { field: "journey_start_date", type: "sort", label: "Sort By Start Date" },
    { field: "journey_start_date", type: "range", label: "Journey Date Range" },
    { field: "truck.truck_no", type: "text", label: "Truck Number" },
    { field: "driver.name", type: "text", label: "Driver Name" },
    { field: "status", type: "text", label: "Status" },
];
