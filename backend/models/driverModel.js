import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    driver_img: { type: String },
    address: { type: String },
    phone: { type: String, match: /^[0-9]{10}$/ },
    home_phone: { type: String, match: /^[0-9]{10}$/ },
    adhaar_no: { type: String, unique: true },
    dl: { type: String, unique: true },
    adhaar_front_img: { type: String },
    adhaar_back_img: { type: String },
    dl_img: { type: String },
    is_deleted: { type: Boolean, default: false },
    vehicles: {
      type: [
        {
          vehicle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
          },
          assignedAt: { type: Date, default: Date.now },
          unassignedAt: { type: Date },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

driverSchema.index({ name: 1 });
driverSchema.index({ phone: 1 });
driverSchema.index({ "vehicles.vehicle_id": 1 });
driverSchema.index({ adhaar_no: 1 }, { unique: true });
driverSchema.index({ dl: 1 }, { unique: true });

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;
