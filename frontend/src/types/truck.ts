
export interface TruckType {
    _id: string,
    truck_no: string,
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
    drivers: [],
    createdAt: "",
    updatedAt: ""
}

export const TRUCK_ENTRY_LABELS = {
    truck_no: "Truck Number",
    drivers: "Drivers"
}