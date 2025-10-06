import type { BillEntryType } from "../types/billEntry";
import type { FilterConfig } from "./filter";

export const BillEntryFilters: FilterConfig<BillEntryType>[] = [
  { field: "bill_date", type: "month", label: "Select Month" },
  { field: "bill_no", type: "text", label: "Bill Number" },
  { field: "lr_no", type: "text", label: "LR Number" },
  { field: "vehicle_no", type: "text", label: "Vehicle Number" }
];