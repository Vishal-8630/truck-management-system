import BillingParty from '../models/billingPartyModel.js';
import AppError from '../utils/appError.js';
import { successResponse } from '../utils/response.js';

const newBillingParty = async (req, res, next) => {
    const { name, address, gst_no } = req.body;
    const party = new BillingParty({
        name,
        address,
        gst_no
    });
    await party.save();
    return successResponse(res, "Billing Party Added", {});
}

const getAllBillingParties = async (req, res) => {
    const parties = await BillingParty.find().sort({ createdAt: -1 });
    return successResponse(res, "", parties);
}

const updateBillingParty = async (req, res, next) => {
    const partyId = req.params.id;
    const { name, address, gst_no } = req.body;

    const party = await BillingParty.findByIdAndUpdate(partyId, {
        name,
        address,
        gst_no
    }, { new: true });

    if (!party) {
        return next(new AppError("Billing Party not found", 404));
    }
    return successResponse(res, "Billing Party Updated", party);
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