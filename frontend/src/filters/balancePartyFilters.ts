import type { BalancePartyType } from "../types/vehicleEntry";
import type { FilterConfig } from "./filter";

export const BalancePartyFilters: FilterConfig<BalancePartyType>[] = [
  { field: "date", type: "month", label: "Select Month" },
  { field: "party_name", type: "text", label: "Balance Party Name" },
];
