import { EmptyBillingParty, type BillingPartyType } from "./billingParty";
import { EmptyDriverType, type DriverType } from "./driver";
import { EmptyJourneyType, type JourneyType } from "./journey";
import { EmptySettlementType, type SettlementType } from "./settlement";
import { EmptyTruckType, type TruckType } from "./truck";
import { EmptyVehicleEntry, type VehicleEntryType } from "./vehicleEntry";

export interface LedgerGSTDetails {
  rate: number;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface LedgerMeta {
  [key: string]: string | number | boolean | null; // dynamic meta fields
}

export interface LedgerType {
  _id: string;
  date: string;

  journey?: JourneyType;
  truck?: TruckType;
  driver?: DriverType;
  party?: BillingPartyType;
  settlement?: SettlementType;
  vehicle_entry?: VehicleEntryType;

  category:
    | "Freight Income"
    | "Diesel Expense"
    | "Driver Advance"
    | "Driver Settlement"
    | "In Account"
    | "Driver Expense"
    | "Toll Expense"
    | "Repair Expense"
    | "Maintenance Expense"
    | "Office Expense"
    | "Payment Received"
    | "Payment Made"
    | "Cash Transfer"
    | "Bank Transfer"
    | "Other Income"
    | "Other Expense";

  transaction_type:
    | "Journey"
    | "Vehicle Entry"
    | "Driver Settlement"
    | "Manual Adjustment"
    | "Payment Receipt"
    | "Expense";

  description?: string;
  debit?: number;
  credit?: number;
  amount?: number;
  balance_type?: "Debit" | "Credit";

  payment_mode: "Cash" | "Bank" | "UPI" | "Cheque" | "Credit";
  reference_no?: string;
  notes?: string;

  is_auto_generated?: boolean;
  is_reversed?: boolean;
  is_verified?: boolean;
  is_locked?: boolean;

  locked_at?: string;
  created_by?: string;
  updated_by?: string;

  gst_details?: LedgerGSTDetails;
  meta?: LedgerMeta;
  balance_after_transaction?: number;

  createdAt?: string;
  updatedAt?: string;
}

export const LEDGER_LABELS: Record<
  keyof Omit<LedgerType, "_id" | "meta" | "gst_details">,
  string
> = {
  date: "Transaction Date",
  journey: "Journey",
  truck: "Truck",
  driver: "Driver",
  party: "Billing Party",
  settlement: "Driver Settlement",
  vehicle_entry: "Vehicle Entry",
  category: "Category",
  transaction_type: "Transaction Type",
  description: "Description",
  debit: "Debit (₹)",
  credit: "Credit (₹)",
  amount: "Amount",
  balance_type: "Balance Type",
  payment_mode: "Payment Mode",
  reference_no: "Reference No",
  notes: "Notes",
  is_auto_generated: "Auto Generated",
  is_reversed: "Reversed",
  is_verified: "Verified",
  is_locked: "Locked",
  locked_at: "Locked At",
  created_by: "Created By",
  updated_by: "Updated By",
  balance_after_transaction: "Balance After Transaction",
  createdAt: "Created On",
  updatedAt: "Updated On",
};

export const EmptyLedgerEntry: LedgerType = {
  _id: "",
  date: new Date().toISOString().split("T")[0],
  journey: EmptyJourneyType,
  truck: EmptyTruckType,
  driver: EmptyDriverType,
  party: EmptyBillingParty,
  settlement: EmptySettlementType,
  vehicle_entry: EmptyVehicleEntry,
  category: "Other Expense",
  transaction_type: "Manual Adjustment",
  description: "",
  debit: 0,
  credit: 0,
  amount: 0,
  balance_type: "Debit",
  payment_mode: "Cash",
  reference_no: "",
  notes: "",
  is_auto_generated: false,
  is_reversed: false,
  is_verified: false,
  is_locked: false,
  created_by: "",
  updated_by: "",
  gst_details: {
    rate: 0,
    amount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
  },
  meta: {},
  balance_after_transaction: 0,
};
