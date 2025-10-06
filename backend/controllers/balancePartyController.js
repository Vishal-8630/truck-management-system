import BalanceParty from "../models/balanceParty.js";
import { successResponse } from "../utils/response.js";

const newBalanceParty = async (req, res, next) => {
    const { party_name } = req.body;
    const party = new BalanceParty({ party_name });
    if (!party) {
        return next(new AppError("Failed to create new balance party", 400));
    }
    await party.save();
    return successResponse(res, "Balance Party Added Successfully");
};

const getAllBalanceParties = async (req, res) => {
    const balanceParties = await BalanceParty.find().sort({ createdAt: -1 });
    return successResponse(res, "", balanceParties);
};

const updateBalanceParty = async (req, res, next) => {
    const id = req.params.id;
    const { party_name } = req.body;
    const party = await BalanceParty.findByIdAndUpdate(id, { party_name }, { new: true });
    if (!party) {
        return next(new AppError("Balance Party not found", 404));
    }
    return successResponse(res, "Balance Party Updated Successfully", party);
}

export { newBalanceParty, getAllBalanceParties, updateBalanceParty };