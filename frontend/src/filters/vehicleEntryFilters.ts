import type { VehicleEntryType } from "../types/vehicleEntry";
import type { FilterConfig } from "./filter";

export const VehicleEntryFilters: FilterConfig<VehicleEntryType>[] = [
  { field: "date", type: "month", label: "Select Month" },
  { field: "date", type: "sort", label: "Sort By Date" },
  { field: "date", type: "range", label: "Date Range" },
  { field: "vehicle_no", type: "text", label: "Vehicle Number" },
  { field: "from", type: "text", label: "From" },
  { field: "to", type: "text", label: "To" },
  { field: "balance_party.party_name", type: "text", label: "Party Name" },
  { field: "status", type: "text", label: "Status" },
];