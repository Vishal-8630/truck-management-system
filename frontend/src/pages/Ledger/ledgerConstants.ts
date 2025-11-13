// --------------------------
// CATEGORY CONSTANTS
// --------------------------
export const LEDGER_CATEGORIES = [
  "Freight Income",
  "Diesel Expense",
  "Driver Advance",
  "Driver Settlement",
  "In Account",
  "Driver Expense",
  "Toll Expense",
  "Repair Expense",
  "Maintenance Expense",
  "Office Expense",
  "Payment Received",
  "Payment Made",
  "Cash Transfer",
  "Bank Transfer",
  "Other Income",
  "Other Expense",
] as const;

export type LedgerCategory = (typeof LEDGER_CATEGORIES)[number];

export const LEDGER_CATEGORY_LABELS: Record<LedgerCategory, string> = {
  "Freight Income": "Freight Income",
  "Diesel Expense": "Diesel Expense",
  "Driver Advance": "Driver Advance",
  "Driver Settlement": "Driver Settlement",
  "In Account": "In Account",
  "Driver Expense": "Driver Expense",
  "Toll Expense": "Toll Expense",
  "Repair Expense": "Repair Expense",
  "Maintenance Expense": "Maintenance Expense",
  "Office Expense": "Office Expense",
  "Payment Received": "Payment Received",
  "Payment Made": "Payment Made",
  "Cash Transfer": "Cash Transfer",
  "Bank Transfer": "Bank Transfer",
  "Other Income": "Other Income",
  "Other Expense": "Other Expense",
};

// --------------------------
// TRANSACTION TYPE CONSTANTS
// --------------------------
export const LEDGER_TRANSACTION_TYPES = [
  "Journey",
  "Vehicle Entry",
  "Driver Settlement",
  "Manual Adjustment",
  "Payment Receipt",
  "Expense",
] as const;

export type LedgerTransactionType = (typeof LEDGER_TRANSACTION_TYPES)[number];

export const LEDGER_TRANSACTION_LABELS: Record<LedgerTransactionType, string> = {
  Journey: "Journey",
  "Vehicle Entry": "Vehicle Entry",
  "Driver Settlement": "Driver Settlement",
  "Manual Adjustment": "Manual Adjustment",
  "Payment Receipt": "Payment Receipt",
  Expense: "Expense",
};

// --------------------------
// PAYMENT MODE CONSTANTS
// --------------------------
export const LEDGER_PAYMENT_MODES = [
  "Cash",
  "Bank",
  "UPI",
  "Cheque",
  "Credit",
] as const;

export type LedgerPaymentMode = (typeof LEDGER_PAYMENT_MODES)[number];

export const LEDGER_PAYMENT_MODE_LABELS: Record<LedgerPaymentMode, string> = {
  Cash: "Cash",
  Bank: "Bank Transfer",
  UPI: "UPI / QR",
  Cheque: "Cheque",
  Credit: "Credit / Pending",
};

// --------------------------
// BALANCE TYPE CONSTANTS
// --------------------------
export const LEDGER_BALANCE_TYPES = ["Debit", "Credit"] as const;

export type LedgerBalanceType = (typeof LEDGER_BALANCE_TYPES)[number];

export const LEDGER_BALANCE_TYPE_LABELS: Record<LedgerBalanceType, string> = {
  Debit: "Debit",
  Credit: "Credit",
};

// --------------------------
// GST CONSTANTS
// --------------------------
export const LEDGER_GST_RATES = [0, 5, 12, 18, 28] as const;

export const LEDGER_GST_LABELS: Record<number, string> = {
  0: "GST 0%",
  5: "GST 5%",
  12: "GST 12%",
  18: "GST 18%",
  28: "GST 28%",
};

// --------------------------
// META FIELD LABELS (EXAMPLES)
// These are dynamic, can grow by category
// --------------------------
export const LEDGER_META_LABELS: Record<string, string> = {
  pump_name: "Pump Name",
  quantity_litre: "Quantity (Litres)",
  rate_per_litre: "Rate per Litre (₹)",
  toll_name: "Toll Name",
  repair_type: "Repair Type",
  mechanic_name: "Mechanic Name",
  expense_note: "Expense Note",
  settlement_reference: "Settlement Ref",
  cash_from: "Cash From",
  cash_to: "Cash To",
};