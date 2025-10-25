import mongoose from "mongoose";

const truckJourneySchema = new mongoose.Schema({
  truck: { type: mongoose.Schema.Types.ObjectId, ref: "Truck", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },

  from: { type: String, required: true, trim: true },
  to: { type: String, required: true, trim: true },
  route: { type: [String], default: [] },

  journey_days: { type: String, required: true, default: "5" },
  journey_start_date: { type: String },
  journey_end_date: { type: String },

  distance_km: { type: String },
  average_mileage: { type: String },

  status: {
    type: String,
    enum: ["Active", "Completed", "Delayed", "Cancelled"],
    default: "Active"
  },

  working_expenses: {
    type: [
      {
        amount: { type: String, default: "0" },
        reason: { type: String, default: "" }
      }
    ],
    default: []
  },

  diesel_expenses: {
    type: [
      {
        amount: { type: String, default: "0" },
        quantity: { type: String, default: "0" },
        filling_date: { type: String }
      }
    ],
    default: []
  },

  delays: {
    type: [
      {
        place: String,
        date: String,
        reason: String
      }
    ],
    default: []
  },

  settlement: {
    amount_paid: { type: String, default: "0" },
    date_paid: String,
    mode: String,
    remarks: String
  },

  total_working_expense: { type: String, default: "0" },
  total_diesel_expense: { type: String, default: "0" },

  daily_progress: {
    type: [
      {
        day_number: String,
        date: String,
        location: String,
        remarks: String
      }
    ],
    default: []
  },

  issues: {
    type: [
      {
        date: String,
        note: String
      }
    ],
    default: []
  },

  journey_summary: { type: String, trim: true },

  delivery_details: {
    delivered_to: String,
    delivery_date: String,
    remarks: String
  },

  status_updates: {
    type: [
      {
        status: String,
        timestamp: String
      }
    ],
    default: []
  },

  is_deleted: { type: Boolean, default: false }

}, { timestamps: true });

// --- Hooks ---
truckJourneySchema.pre("save", function (next) {
  const today = new Date();

  if (!this.journey_start_date) {
    this.journey_start_date = today.toISOString().split('T')[0];
  }

  if (!this.journey_end_date) {
    const days = parseInt(this.journey_days, 10) || 5;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    this.journey_end_date = endDate.toISOString().split('T')[0];
  }

  // ✅ (4) Safety check: Ensure expense arrays exist before summing
  const sum = arr => Array.isArray(arr)
    ? arr.reduce((a, b) => a + (parseFloat(b.amount) || 0), 0)
    : 0;

  this.total_working_expense = String(sum(this.working_expenses));
  this.total_diesel_expense = String(sum(this.diesel_expenses));

  // ✅ (5) Auto-generate daily progress if missing or mismatched with journey_days
  const totalDays = parseInt(this.journey_days, 10) || 5;
  if (!Array.isArray(this.daily_progress) || this.daily_progress.length !== totalDays) {
    const startDate = new Date(this.journey_start_date);
    this.daily_progress = Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return {
        day_number: String(i + 1),
        date: date.toISOString().split('T')[0],
        location: "",
        remarks: ""
      };
    });
  }

  if (this.status === "Completed" && !this.journey_summary) {
    this.journey_summary = `${this.from} → ${this.to} (${this.journey_days} days, ${this.distance_km || "N/A"} km)`;
  }

  next();
});

truckJourneySchema.virtual("total_expense").get(function() {
  const total = 
    parseFloat(this.total_diesel_expense || 0) + 
    parseFloat(this.total_working_expense || 0);
  return String(total);
});

truckJourneySchema.index({ truck_id: 1 });
truckJourneySchema.index({ driver: 1 });
truckJourneySchema.index({ status: 1 });
truckJourneySchema.index({ journey_start_date: 1 });
truckJourneySchema.index({ is_deleted: 1 });

const TruckJourney = mongoose.model("TruckJourney", truckJourneySchema);
export default TruckJourney;