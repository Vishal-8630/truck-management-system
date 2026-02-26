import type { SettlementType } from "@/types/settlement";
import type { FilterConfig } from "@/filters/filter";

export const SettlementFilters: FilterConfig<SettlementType>[] = [
    { field: "createdAt", type: "month", label: "Select Month" },
    { field: "createdAt", type: "sort", label: "Sort By Date" },
    { field: "period.from", type: "range", label: "Period Date Range" },
    { field: "driver.name", type: "text", label: "Driver Name" },
    {
        field: "is_settled",
        type: "select",
        label: "Status",
        options: [
            { label: "Settled", value: "true" },
            { label: "Pending", value: "false" }
        ]
    },
    {
        field: "payment_status",
        type: "select",
        label: "Who has to pay?",
        options: [
            { label: "Balanced", value: "Balanced" },
            { label: "Driver needs to pay", value: "Driver needs to pay" },
            { label: "DRL needs to pay", value: "DRL needs to pay" }
        ]
    },
];
