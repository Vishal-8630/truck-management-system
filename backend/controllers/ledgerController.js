import Ledger from "../models/ledgerModel.js";
import { successResponse } from '../utils/response.js';
import logAuditEvent from "../utils/audit/logAuditEvent.js";

// Helper: extract ObjectId from frontend object { _id: "..." }
const extractId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value._id) return value._id;
    return null;
};

// Helper: calculate running balance
const calculateNewBalance = async () => {
    const lastEntry = await Ledger.findOne().sort({ createdAt: -1 });

    if (!lastEntry) return 0;

    return lastEntry.balance_after_transaction;
};

const newLedger = async (req, res) => {
    try {
        const data = req.body;
        const errors = {};
        if (!data.date) errors.date = "Transaction date is required";
        if (!data.category) errors.category = "Category is required";
        if (!data.transaction_type) errors.transaction_type = "Transaction type is required";

        const debit = Number(data.debit) || 0;
        const credit = Number(data.credit) || 0;
        if (debit <= 0 && credit <= 0) {
            errors.debit = "Amount required";
            errors.credit = "Amount required";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ status: "fail", errors });
        }

        // STEP 1: Extract ObjectIds safely
        const journey_id = extractId(data.journey);
        const truck_id = extractId(data.truck);
        const driver_id = extractId(data.driver);
        const party_id = extractId(data.party);
        const settlement_id = extractId(data.settlement);
        const vehicle_entry_id = extractId(data.vehicle_entry);

        // STEP 2: Calculate amount
        const amount = credit > 0 ? credit : debit;
        const balance_type = credit > 0 ? "Credit" : "Debit";

        // STEP 3: Calculate new running balance
        const previous = await calculateNewBalance();
        const newBalance =
            balance_type === "Credit"
                ? previous + amount
                : previous - amount;

        // STEP 4: Create ledger entry object
        const ledgerData = {
            date: data.date,
            category: data.category,
            transaction_type: data.transaction_type,
            description: data.description || "",
            debit,
            credit,
            amount,
            balance_type,
            payment_mode: data.payment_mode,
            reference_no: data.reference_no,
            reference_type: data.reference_type,
            notes: data.notes || "",
            is_auto_generated: false,
            is_reversed: false,
            created_by: data.created_by || "system",
            updated_by: data.updated_by || "system",

            journey: journey_id,
            truck: truck_id,
            driver: driver_id,
            party: party_id,
            settlement: settlement_id,
            vehicle_entry: vehicle_entry_id,

            gst_details: data.gst_details || {},
            meta: data.meta || {},

            balance_after_transaction: newBalance,
        };

        // STEP 5: Save to DB
        const ledgerEntry = await Ledger.create(ledgerData);
        await logAuditEvent({
            req,
            entityType: "ledger",
            entityId: ledgerEntry._id,
            action: "create",
            before: {},
            after: ledgerEntry.toObject(),
        });

        return res.status(201).json({
            success: true,
            message: "Ledger entry created successfully",
            data: ledgerEntry,
        });

    } catch (error) {
        console.error("Error creating ledger:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create ledger",
            error: error.message,
        });
    }
};

const updateLedger = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const ledger = await Ledger.findById(id);
        if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });
        const beforeSnapshot = ledger.toObject();

        // Extract ObjectIds safely
        const journey_id = extractId(data.journey);
        const truck_id = extractId(data.truck);
        const driver_id = extractId(data.driver);
        const party_id = extractId(data.party);
        const settlement_id = extractId(data.settlement);
        const vehicle_entry_id = extractId(data.vehicle_entry);

        const debit = Number(data.debit) || 0;
        const credit = Number(data.credit) || 0;
        const amount = credit > 0 ? credit : debit;
        const balance_type = credit > 0 ? "Credit" : "Debit";

        const ledgerData = {
            date: data.date,
            category: data.category,
            transaction_type: data.transaction_type,
            description: data.description || "",
            debit,
            credit,
            amount,
            balance_type,
            payment_mode: data.payment_mode,
            reference_no: data.reference_no,
            reference_type: data.reference_type,
            notes: data.notes || "",
            journey: journey_id,
            truck: truck_id,
            driver: driver_id,
            party: party_id,
            settlement: settlement_id,
            vehicle_entry: vehicle_entry_id,
            gst_details: data.gst_details || {},
            meta: data.meta || {},
        };

        const updated = await Ledger.findByIdAndUpdate(id, ledgerData, { new: true });
        await logAuditEvent({
            req,
            entityType: "ledger",
            entityId: updated._id,
            action: "update",
            before: beforeSnapshot,
            after: updated.toObject ? updated.toObject() : updated,
        });
        return successResponse(res, "Ledger Entry Updated", updated);
    } catch (error) {
        console.error("Error updating ledger:", error);
        return res.status(500).json({ success: false, message: "Failed to update ledger" });
    }
};

const deleteLedger = async (req, res, next) => {
    try {
        const { id } = req.params;
        const beforeSnapshot = await Ledger.findById(id).lean();
        const ledger = await Ledger.findByIdAndDelete(id);
        if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });
        await logAuditEvent({
            req,
            entityType: "ledger",
            entityId: ledger._id,
            action: "delete",
            before: beforeSnapshot || {},
            after: {},
        });
        return successResponse(res, "Ledger Entry Deleted");
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete ledger" });
    }
};

const allLedgers = async (req, res) => {
    const ledgers = await Ledger.find()
        .populate("journey")
        .populate("truck")
        .populate("driver")
        .populate("party")
        .populate("settlement")
        .populate("vehicle_entry");
    return successResponse(res, "", ledgers);
}

export { newLedger, allLedgers, updateLedger, deleteLedger }