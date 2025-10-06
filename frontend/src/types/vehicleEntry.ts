export interface BalancePartyType {
    _id: string;
    party_name: string;
}

export interface VehicleEntryType {
    _id: string;
    date: string;
    vehicle_no: string;
    from: string;
    to: string;
    freight: string;
    driver_cash: string;
    dala: string;
    kamisan: string;
    in_ac: string;
    halting: string;
    balance: string;
    balance_party: BalancePartyType;
    owner: string;
    status: "Pending" | "Received";
    movementType: "From DRL" | "To DRL";
}

export const EmptyVehicleEntry: VehicleEntryType = {
    _id: "",
    date: "",
    vehicle_no: "",
    from: "",
    to: "",
    freight: "",
    driver_cash: "",
    dala: "",
    kamisan: "",
    in_ac: "",
    halting: "",
    balance: "",
    balance_party: {
        _id: "",
        party_name: "",
    },
    owner: "",
    status: "Pending",
    movementType: "From DRL",
};

export const VEHICLE_ENTRY_LABELS = {
    date: "Date",
    vehicle_no: "Vehicle No",
    from: "From",
    to: "To",
    freight: "Freight",
    driver_cash: "Driver Cash",
    dala: "Dala",
    kamisan: "Kamisan",
    in_ac: "In AC",
    halting: "Halting",
    balance: "Balance",
    balance_party: "Party Name",
    owner: "Owner",
    status: "Status",
    movementType: "Movement Type",
};