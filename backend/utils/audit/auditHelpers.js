/**
 * Generates a human-readable label for a populated entity object for audit logging.
 * This prevents GUIDs and nested object history from cluttering the audit logs.
 */
export const getEntityLabel = (obj, entityType) => {
    if (!obj) return null;
    if (typeof obj === "string") return obj; // Already a GUID or string

    switch (entityType) {
        case "truck":
            return obj.truck_no || obj._id;
        case "driver":
            return obj.name || obj._id;
        case "party":
        case "billing_party":
        case "balance_party":
            return obj.name || obj.party_name || obj._id;
        case "journey":
            return `${obj.truck?.truck_no || "Truck"} | ${obj.driver?.name || "Driver"} | ${obj.from} → ${obj.to}`;
        case "settlement":
            return `${obj.driver?.name || "Driver"} Settlement`;
        case "vehicle_entry":
            return `${obj.vehicle_no || "Vehicle"} Entry`;
        default:
            return obj.name || obj.truck_no || obj._id || String(obj);
    }
};

/**
 * Prepares a snapshot of an object for audit logging by flattening relations into labels.
 */
export const prepareAuditSnapshot = (doc, relationMap = {}) => {
    if (!doc) return {};
    const snapshot = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };

    Object.entries(relationMap).forEach(([field, type]) => {
        if (snapshot[field]) {
            snapshot[field] = getEntityLabel(snapshot[field], type);
        }
    });

    return snapshot;
};
