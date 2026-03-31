import AuditLog from "../../models/auditLogModel.js";
import computeDiff from "./computeDiff.js";
import getActorFromRequest from "./getActorFromRequest.js";

const logAuditEvent = async ({
  req,
  entityType,
  entityId,
  action = "update",
  before = {},
  after = {},
}) => {
  try {
    if (!entityType || !entityId) return;

    const actor = await getActorFromRequest(req);
    const { changedFields, beforeValues, afterValues } = computeDiff(before, after);

    await AuditLog.create({
      entityType,
      entityId: String(entityId),
      action,
      changedFields,
      before: beforeValues,
      after: afterValues,
      actor,
      meta: {
        ip: req.ip || "",
        path: req.originalUrl || "",
        method: req.method || "",
      },
    });
  } catch (error) {
    console.warn("Audit logging failed:", error?.message || error);
  }
};

export default logAuditEvent;
