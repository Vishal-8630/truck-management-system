export interface DriverType {
    _id: string,
    name: string,
    driver_img?: string | File,
    address?: string,
    phone: string,
    home_phone?: string,
    adhaar_no: string,
    dl: string,
    adhaar_front_img?: string | File,
    adhaar_back_img?: string | File,
    dl_img?: string | File,
    vehicles: {
        vehicle_id: string,
        assignedAt: string,
        unassignedAt?: string
    }[],
    createdAt: string,
    updatedAt: string
}

export const EmptyDriverType: DriverType = {
    _id: "",
    name: "",
    driver_img: "",
    address: "",
    phone: "",
    home_phone: "",
    adhaar_no: "",
    dl: "",
    adhaar_front_img: "",
    adhaar_back_img: "",
    dl_img: "",
    vehicles: [],
    createdAt: "",
    updatedAt: ""
}

export const DRIVER_ENTRY_LABELS = {
    name: "Name",
    driver_img: "Image",
    address: "Address",
    phone: "Phone Number",
    home_phone: "Home Phone Number",
    adhaar_no: "Adhaar Number",
    dl: "Driving License",
    adhaar_img: "Adhaar Image",
    dl_img: "Driving License Image",
    vehicles: []
}