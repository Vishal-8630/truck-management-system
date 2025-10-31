import mongoose from "mongoose";

const extraChargeSchema = mongoose.Schema({
    type: { // Type of extra charge, e.g., "Unloading", "Packagin"
        type: String,
    },
    amount: { // actual charge value
        type: String,
    },
    rate: { // rate for extra charge
        type: String,
    },
    per_amount: { // per amount (if applicable)
        type: String,
    }
})

const entrySchema = mongoose.Schema({
    bill_no: {
        type: String,
    },
    bill_date: {
        type: Date,
    },
    billing_party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BillingParty"
    },
    lr_no: {
        type: String,
    },
    lr_date: {
        type: Date,
    },
    consignor_name: {
        type: String,
    },
    consignor_from_address: {
        type: String,
    },
    consignor_gst_no: {
        type: String,
    },
    consignee: {
        type: String,
    },
    consignee_gst_no: {
        type: String,
    },
    consignor_to_address: {
        type: String,
    },
    pkg: {
        type: String,
    },
    vehicle_no: {
        type: String,
    },
    from: {
        type: String,
    },
    to: {
        type: String,
    },
    be_no: {
        type: String,
    },
    be_date: {
        type: Date,
    },
    weight: {
        type: String,
    },
    cbm: {
        type: String,
    },
    fixed: {
        type: String,
    },
    rate_per: {
        type: String,
    },
    mode_of_packing: {
        type: String,
    },
    invoice_no: {
        type: String,
    },
    eway_bill_no: {
        type: String,
    },
    description_of_goods: {
        type: String,
    },
    container_no: {
        type: String,
    },
    value: {
        type: String,
    },
    name_of_clerk: {
        type: String,
    },
    empty_yard_name: {
        type: String,
    },
    remark_if_any: {
        type: String,
    },
    to_be_billed_at: {
        type: String,
    },
    hire_amount: {
        type: String,
    },
    risk: {
        type: String,
    },
    address_of_billing_office: {
        type: String,
    },
    rate: {
        type: String,
    },
    advance: {
        type: String,
    },
    extra_charges: [extraChargeSchema],
    sub_total: {
        type: String,
    },
    cgst: {
        type: String,
    },
    sgst: {
        type: String,
    },
    igst: {
        type: String,
    },
    grand_total: {
        type: String,
    },
    gst_up: {
        type: String,
    },
    if_gst_other_state: {
        type: String,
    }, 
    tax_state: {
        type: String,
        enum: ["UP", "Other"],
        default: "UP"
    }
}, { timestamps: true });

const Entry = mongoose.model("Entry", entrySchema);
export default Entry;
