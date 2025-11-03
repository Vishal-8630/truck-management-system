import { EmptyDriverType, type DriverType } from "./driver";
import type { JourneyType } from "./journey";

export interface SettlementType {
    _id: string;
    driver: DriverType;
    period: {
        from: string;
        to: string
    }
    journeys: JourneyType[],

    total_driver_expenses: string;
    total_diesel_expenses: string;
    total_diesel_quantity: string;
    total_driver_expense: string;
    total_diesel_expense: string;
    total_journey_starting_cash: string;
    total_rate_per_km: string;
    total_distance: string;
    avg_mileage: string;

    total_diesel_used: string; // distance / mileage
    diesel_diff: string; // used - given
    diesel_value: string; // diesel compensation

    rate_per_km: string;
    diesel_rate: string;
    extra_expense: string;

    driver_total: string;
    owner_total: string;
    overall_total: string;

    status: "Pending" | "Paid to Driver" | "Received from Driver";

    payment_meta: {
        mode: string,
        date: string,
        remarks: string
    }

    createdAt: string;
    updatedAt: string;
}

export const EmptySettlementType: SettlementType = {
    _id: "",
    driver: EmptyDriverType,
    period: {
        from: "",
        to: ""
    },
    journeys: [],

    total_driver_expenses: "",
    total_diesel_expenses: "",
    total_diesel_quantity: "",
    total_journey_starting_cash: "",
    total_diesel_expense: "",
    total_driver_expense: "",
    total_rate_per_km: "",
    total_distance: "",
    avg_mileage: "",

    total_diesel_used: "", // distance / mileage
    diesel_diff: "", // used - given
    diesel_value: "", // diesel compensation

    driver_total: "",
    owner_total: "",
    overall_total: "",

    rate_per_km: "",
    diesel_rate: "",
    extra_expense: "",

    status: "Pending",

    payment_meta: {
        mode: "",
        date: "",
        remarks: ""
    },

    createdAt: "",
    updatedAt: ""
}

export interface SettlementResponseType {
    success: boolean;
    message: string;
    data: SettlementType;
}

