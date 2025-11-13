import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },

    journey: { type: mongoose.Schema.Types.ObjectId, ref: "TruckJourney" },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: "Truck" },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    party: { type: mongoose.Schema.Types.ObjectId, ref: "BillingParty" },
    settlement: { type: mongoose.Schema.Types.ObjectId, ref: "Settlement" },
    vehicle_entry: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleEntry" },

    category: {
      type: String,
      enum: [
        "Freight Income", "Diesel Expense", "Driver Advance", "Driver Settlement",
        "In Account", "Driver Expense", "Toll Expense", "Repair Expense",
        "Maintenance Expense", "Office Expense", "Payment Received", "Payment Made",
        "Cash Transfer", "Bank Transfer", "Other Income", "Other Expense",
      ],
      required: true,
    },

    transaction_type: {
      type: String,
      enum: [
        "Journey", "Vehicle Entry", "Driver Settlement",
        "Manual Adjustment", "Payment Receipt", "Expense",
      ],
      default: "Manual Adjustment",
    },

    description: { type: String },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    amount: {
      type: Number,
      default: function () {
        return this.credit > 0 ? this.credit : this.debit;
      },
    },
    balance_type: {
      type: String,
      enum: ["Debit", "Credit"],
      default: function () {
        return this.credit > 0 ? "Credit" : "Debit";
      },
    },

    payment_mode: {
      type: String,
      enum: ["Cash", "Bank", "UPI", "Cheque", "Credit"],
      default: "Cash",
    },
    reference_no: { type: String },
    notes: { type: String },

    is_auto_generated: { type: Boolean, default: false },
    is_reversed: { type: Boolean, default: false },
    parent_entry_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },

    is_verified: { type: Boolean, default: false },
    is_locked: { type: Boolean, default: false },
    locked_at: { type: Date },

    created_by: { type: String },
    updated_by: { type: String },

    gst_details: {
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
    },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    balance_after_transaction: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 🔍 Indexes
ledgerSchema.index({ date: 1 });
ledgerSchema.index({ category: 1 });
ledgerSchema.index({ truck_id: 1, date: 1 });
ledgerSchema.index({ driver_id: 1, date: 1 });
ledgerSchema.index({ party_id: 1, date: 1 });
ledgerSchema.index({ journey_id: 1, category: 1 });
ledgerSchema.index({ payment_mode: 1 });
ledgerSchema.index({ is_auto_generated: 1 });

const Ledger = mongoose.model("Ledger", ledgerSchema);
export default Ledger;