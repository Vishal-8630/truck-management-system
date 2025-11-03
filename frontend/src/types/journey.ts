import { EmptyDriverType, type DriverType } from "./driver";
import { EmptySettlementType, type SettlementType } from "./settlement";
import { EmptyTruckType, type TruckType } from "./truck";

export interface JourneyType {
  _id: string;
  truck: TruckType;
  driver: DriverType;

  from: string;
  to: string;
  route: string[];

  journey_days: string;
  journey_start_date: string;
  journey_end_date: string;
  journey_starting_cash: string;

  distance_km: string;
  loaded_weight: string;
  average_mileage: string;

  starting_kms: string;
  ending_kms: string;

  status: "Active" | "Completed" | "Delayed" | "Cancelled";

  driver_expenses: {
    amount: string;
    reason: string;
    date: string;
  }[];

  diesel_expenses: {
    amount: string;
    quantity: string;
    filling_date: string;
  }[];

  delays: {
    place: string;
    reason: string;
    date: string;
  }[];

  settlement: {
    amount_paid: string;
    date_paid: string;
    mode: string;
    remarks: string;
  };

  total_driver_expense: string;
  total_diesel_expense: string;

  daily_progress: {
    day_number: string;
    date: string;
    location: string;
    remarks: string;
  }[];

  issues: {
    date: string;
    note: string;
  }[];

  journey_summary: string;

  delivery_details: {
    delivered_to: string;
    entry_date: string;
    empty_date: string;
    remarks: string;
  };

  status_updates: {
    status: string;
    timestamp: string;
  }[];

  total_expense: string;

  settled: boolean;
  settlement_ref: SettlementType;

  createdAt: string;
  updatedAt: string;
}

export const EmptyJourneyType: JourneyType = {
    _id: "",
    truck: EmptyTruckType,
    driver: EmptyDriverType,

    from: "",
    to: "",
    route: [],

    journey_days: "5",
    journey_start_date: "",
    journey_end_date: "",
    journey_starting_cash: "",

    distance_km: "",
    loaded_weight: "",
    average_mileage: "",

    starting_kms: "",
    ending_kms: "",

    status: "Active",

    driver_expenses: [],
    diesel_expenses: [],
    delays: [],
    settlement: {
        amount_paid: "",
        date_paid: "",
        mode: "",
        remarks: ""
    },

    total_driver_expense: "",
    total_diesel_expense: "",

    daily_progress: [],
    issues: [],
    journey_summary: "",

    delivery_details: {
        delivered_to: "",
        entry_date: "",
        empty_date: "",
        remarks: ""
    },

    status_updates: [],
    total_expense: "",

    settled: false,
    settlement_ref: EmptySettlementType,

    createdAt: "",
    updatedAt: ""
}

export const JOURNEY_ENTRY_LABELS = {
    truck: "Truck",
    driver: "Driver",

    from: "From",
    to: "To",
    route: "Route",

    journey_days: "Journey Days",
    journey_start_date: "Journey Start Date",
    journey_end_date: "Journey End Date",

    distance_km: "Distance (Km)",
    average_mileage: "Average Mileage",

    status: "Status",

    driver_expenses: "Working Expenses",
    diesel_expenses: "Diesel Expenses",
    delays: "Delays",
    settlement: "Settlement",

    total_driver_expense: "Total Working Expense",
    total_diesel_expense: "Total Diesel Expense",

    daily_progress: "Daily Progress",
    issues: "Issues",
    journey_summary: "Journey Summary",

    delivery_details: "Delivery Details",
    status_updates: "Status Updates",
    total_expense: "Total Expense"
}