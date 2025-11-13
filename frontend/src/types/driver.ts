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
    dl_front_img?: string | File,
    dl_back_img? : string | File,

    last_payment_clear_date: string,
    last_payment_amount: string,
    advance_amount: string,
    amount_to_pay: string,       // company owes driver
    amount_to_receive: string,   // driver owes company

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
    dl_front_img: "",
    dl_back_img: "",

    last_payment_clear_date: "",
    last_payment_amount: "",
    advance_amount: "",
    amount_to_pay: "",
    amount_to_receive: "",

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
    dl_font_img: "Driving License Front Image",
    dl_back_img: "Driving Licence Back Image",

    last_payment_clear_date: "Last Payment Clear Date",
    last_payment_amount: "Last Payment Amount",
    advance_amount: "Advance Amount",
    amount_to_pay: "Amount to Pay",
    amount_to_receive: "Amount to Receive",
    
    vehicles: []
}