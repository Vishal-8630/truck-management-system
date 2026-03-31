import BalanceParty from "../models/balanceParty.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/appError.js";
import logAuditEvent from "../utils/audit/logAuditEvent.js";

const newBalanceParty = async (req, res, next) => {
    const { party_name } = req.body;
    const party = new BalanceParty({ party_name });
    if (!party) {
        return next(new AppError("Failed to create new balance party", 400));
    }
    await party.save();
    await logAuditEvent({
        req,
        entityType: "balance_party",
        entityId: party._id,
        action: "create",
        before: {},
        after: party.toObject(),
    });
    return successResponse(res, "Balance Party Added Successfully");
};

const getAllBalanceParties = async (req, res) => {
    const balanceParties = await BalanceParty.find().sort({ createdAt: -1 });
    return successResponse(res, "", balanceParties);
};

const updateBalanceParty = async (req, res, next) => {
    const id = req.params.id;
    const { party_name } = req.body;
    const beforeParty = await BalanceParty.findById(id).lean();
    const party = await BalanceParty.findByIdAndUpdate(id, { party_name }, { new: true });
    if (!party) {
        return next(new AppError("Balance Party not found", 404));
    }
    await logAuditEvent({
        req,
        entityType: "balance_party",
        entityId: party._id,
        action: "update",
        before: beforeParty || {},
        after: party.toObject ? party.toObject() : party,
    });
    return successResponse(res, "Balance Party Updated Successfully", party);
}

export { newBalanceParty, getAllBalanceParties, updateBalanceParty };