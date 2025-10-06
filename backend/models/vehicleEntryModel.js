import mongoose from 'mongoose';

const vehicleEntrySchema = mongoose.Schema({
    date: {
        type: String
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
    freight: {
        type: String,
    },
    driver_cash: {
        type: String,
    },
    dala: {
        type: String,
    },
    kamisan: {
        type: String,
    },
    in_ac: {
        type: String,
    },
    balance: {
        type: String,
    },
    halting: {
        type: String,
    },
    pod_stack: {
        type: String,
    },
    owner: {
        type: String,
    },
    balance_party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BalanceParty"
    },
    status: {
        type: String,
        enum: ['Pending', 'Received'],
        default: 'Pending'
    },
    movementType: {
        type: String,
        enum: ["From DRL", "To DRL"],
        default: "From DRL"
    }
}, { timestamps: true });

const VehicleEntry = mongoose.model("VehicleEntry", vehicleEntrySchema);

export default VehicleEntry;