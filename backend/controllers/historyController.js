import AuditLog from "../models/auditLogModel.js";
import { successResponse } from "../utils/response.js";
import { getSignedS3Url } from "../middlewares/s3Helper.js";

const imageFields = [
  "driver_img", "adhaar_front_img", "adhaar_back_img", "dl_front_img", "dl_back_img",
  "fitness_doc", "insurance_doc", "national_permit_doc", "state_permit_doc", "tax_doc", 
  "pollution_doc", "avatar"
];

const signSnapshot = async (snapshot) => {
  if (!snapshot) return snapshot;
  const signed = { ...snapshot };
  for (const field of imageFields) {
    if (signed[field] && typeof signed[field] === "string") {
      signed[field] = await getSignedS3Url(signed[field]);
    }
  }
  return signed;
};

const getEntityHistory = async (req, res) => {
  const { entityType, entityId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const query = { entityType, entityId: String(entityId) };
  const [rows, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(query),
  ]);

  const signedRows = await Promise.all(
    rows.map(async (row) => {
      const doc = row.toObject();
      doc.before = await signSnapshot(doc.before);
      doc.after = await signSnapshot(doc.after);
      return doc;
    })
  );

  return successResponse(res, "", {
    rows: signedRows,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + signedRows.length < total,
    },
  });
};

export { getEntityHistory };
