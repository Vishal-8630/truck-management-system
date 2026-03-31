import BillingParty from '../models/billingPartyModel.js';
import AppError from '../utils/appError.js';
import { successResponse } from '../utils/response.js';
import logAuditEvent from "../utils/audit/logAuditEvent.js";

const newBillingParty = async (req, res, next) => {
    const { name, address, gst_no } = req.body;
    const errors = {};
    if (!name) errors.name = "Company name is required";
    if (!address) errors.address = "Address is required";
    if (!gst_no) errors.gst_no = "GST number is required";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: "fail", errors });
    }

    const existing = await BillingParty.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
        return res.status(400).json({
            status: "fail",
            errors: { name: "Party name already exists" }
        });
    }

    const party = new BillingParty({
        name,
        address,
        gst_no
    });
    await party.save();
    await logAuditEvent({
        req,
        entityType: "billing_party",
        entityId: party._id,
        action: "create",
        before: {},
        after: party.toObject(),
    });
    return successResponse(res, "Billing Party Added", {});
}

const getAllBillingParties = async (req, res) => {
    const parties = await BillingParty.find().sort({ createdAt: -1 });
    return successResponse(res, "", parties);
}

const updateBillingParty = async (req, res, next) => {
    try {
        const partyId = req.params.id;
        const { name, address, gst_no } = req.body;

        const errors = {};
        if (!name) errors.name = "Company name is required";
        if (!address) errors.address = "Address is required";
        if (!gst_no) errors.gst_no = "GST number is required";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ status: "fail", errors });
        }

        const beforeParty = await BillingParty.findById(partyId).lean();
        const party = await BillingParty.findByIdAndUpdate(partyId, {
            name,
            address,
            gst_no
        }, { new: true });

        if (!party) {
            return next(new AppError("Billing Party not found", 404));
        }
        await logAuditEvent({
            req,
            entityType: "billing_party",
            entityId: party._id,
            action: "update",
            before: beforeParty || {},
            after: party.toObject ? party.toObject() : party,
        });
        return successResponse(res, "Billing Party Updated", party);
    } catch (error) {
        return next(new AppError("Failed to update billing party", 500));
    }
}

const getBillingPartyByName = async (req, res, next) => {
    const name = req.params.name;
    const party = await BillingParty.find({ name: { $regex: name, $options: "i" } });
    if (!party) {
        return next(new AppError("Billing Party not found", 404));
    }
    return successResponse(res, "", party);
}

export { newBillingParty, getAllBillingParties, updateBillingParty, getBillingPartyByName };