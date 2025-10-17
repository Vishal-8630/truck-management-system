import mongoose from "mongoose";

const truckSchema = new mongoose.Schema(
  {
    truck_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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