// models/DriverSettlement.js
import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  period: {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  journeys: [{ type: mongoose.Schema.Types.ObjectId, ref: "TruckJourney" }],

  total_driver_expense: { type: Number, default: 0 },
  total_diesel_expense: { type: Number, default: 0 },
  total_diesel_quantity: { type: Number, default: 0 },
  total_journey_starting_cash: { type: Number, default: 0 },
  total_rate_per_km: { type: Number, default: 0 },
  total_distance: { type: Number, default: 0 },
  avg_mileage: { type: Number, default: 0 },

  total_diesel_used: { type: Number, default: 0 },
  diesel_diff: { type: Number, default: 0 },
  diesel_value: { type: Number, default: 0 },

  driver_total: { type: Number, default: 0 },
  owner_total: { type: Number, default: 0 },
  overall_total: { type: Number, default: 0 },

  rate_per_km: { type: Number, default: 0 },
  diesel_rate: { type: Number, default: 0 },
  extra_expense: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Settled", "Driver needs to pay", "DRL needs to pay"],
    default: "Pending"
  },

  payment_meta: {
    mode: String, // Cash/UPI/Bank
    date: String,
    remarks: String
  },
}, { timestamps: true });

const Settlement = mongoose.model("Settlement", settlementSchema);
export default Settlement;