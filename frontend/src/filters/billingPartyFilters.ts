import type { BillingPartyType } from "../types/billingParty";
import type { FilterConfig } from "./filter";

export const BillingPartyFilters: FilterConfig<BillingPartyType>[] = [
  { field: "date", type: "month", label: "Select Month" },
  { field: "name", type: "text", label: "Billing Party Name" },
];
