
export interface TruckType {
    _id: string,
    truck_no: string,
    fitness_doc: File | string,
    fitness_doc_expiry: string,
    insurance_doc: File | string,
    insurance_doc_expiry: string,
    national_permit_doc: File | string,
    national_permit_doc_expiry: string,
    state_permit_doc: File | string,
    state_permit_doc_expiry: string,
    tax_doc: File | string,
    tax_doc_expiry: string,
    pollution_doc: File | string,
    pollution_doc_expiry: string,
    drivers: {
        driver_id: string,
        assignedAt: string,
        unassignedAt?: string
    }[],
    createdAt: string,
    updatedAt: string
}

export const EmptyTruckType: TruckType = {
    _id: "",
    truck_no: "",
    fitness_doc: "",
    fitness_doc_expiry: "",
    insurance_doc: "",
    insurance_doc_expiry: "",
    national_permit_doc: "",
    national_permit_doc_expiry: "",
    state_permit_doc: "",
    state_permit_doc_expiry: "",
    tax_doc: "",
    tax_doc_expiry: "",
    pollution_doc: "",
    pollution_doc_expiry: "",
    drivers: [],
    createdAt: "",
    updatedAt: ""
}

export const TRUCK_ENTRY_LABELS = {
    truck_no: "Truck Number",
    drivers: "Drivers",
    fitness_doc: "Fitness Document",
    fitness_doc_expiry: "Fitness Document Expiry",
    insurance_doc: "Insurance Document",
    insurance_doc_expiry: "Insurance Document Expiry",
    national_permit_doc: "National Permit Document",
    national_permit_doc_expiry: "National Permit Document Expiry",
    state_permit_doc: "State Permit Document",
    state_permit_doc_expiry: "State Permit Document Expiry",
    tax_doc: "Tax Document",
    tax_doc_expiry: "Tax Document Expiry",
    pollution_doc: "Pollution Document",
    pollution_doc_expiry: "Pollution Document Expiry",
}

export const DOCUMENT_FIELDS = {
    fitness_doc: "fitness_doc",
    insurance_doc: "insurance_doc",
    national_permit_doc: "national_permit_doc",
    state_permit_doc: "state_permit_doc",
    tax_doc: "tax_doc",
    pollution_doc: "pollution_doc",
}