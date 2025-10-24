import mongoose from "mongoose";

const truckSchema = new mongoose.Schema(
  {
    truck_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fitness_doc: {
      type: String,
    }, 
    fitness_doc_expiry: {
      type: String,
    },
    insurance_doc: {
      type: String
    },
    insurance_doc_expiry: {
      type: String,
    },
    national_permit_doc: {
      type: String,
    },
    national_permit_doc_expiry: {
      type: String,
    },
    state_permit_doc: {
      type: String,
    },
    state_permit_doc_expiry: {
      type: String,
    },
    tax_doc: {
      type: String,
    },
    tax_doc_expiry: {
      type: String,
    },
    pollution_doc: {
      type: String,
    },
    pollution_doc_expiry: {
      type: String,
    },
    drivers: {
      type: [
        {
          driver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
          },
          assignedAt: { type: Date, default: Date.now },
          unassignedAt: { type: Date },
        },
      ],
      default: [],
    }
  },
  { timestamps: true }
);

truckSchema.index({ truck_no: 1 });
truckSchema.index({ "drivers.driver_id": 1 });

const Truck = mongoose.model("Truck", truckSchema);
export default Truck;