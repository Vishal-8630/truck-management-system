import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ["create", "update", "delete", "status_change"],
      default: "update",
      index: true,
    },
    changedFields: { type: [String], default: [] },
    before: { type: mongoose.Schema.Types.Mixed, default: {} },
    after: { type: mongoose.Schema.Types.Mixed, default: {} },
    actor: {
      id: { type: String, default: "system" },
      username: { type: String, default: "system" },
      fullname: { type: String, default: "System" },
    },
    meta: {
      ip: { type: String, default: "" },
      path: { type: String, default: "" },
      method: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
