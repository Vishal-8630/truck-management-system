import { successResponse } from '../utils/response.js';
import Entry from '../models/billingEntryModel.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

const addNewBillingEntry = async (req, res, next) => {
    const { extra_charges, billing_party, _id, ...rest } = req.body;
    const charges = [];

    const { lr_no, date, consignor, consignee } = rest;
    const errors = {};
    if (!billing_party || !billing_party._id) errors.billing_party = "Billing party is required";
    if (!lr_no) errors.lr_no = "LR Number is required";
    if (!date) errors.date = "Date is required";
    if (!consignor) errors.consignor = "Consignor is required";
    if (!consignee) errors.consignee = "Consignee is required";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: "fail", errors });
    }

    if (Array.isArray(extra_charges)) {
        extra_charges.forEach((charge) => {
            charges.push({
                type: charge.type,
                amount: charge.amount,
                rate: charge.rate,
                per_amount: charge.per_amount
            });
        });
    }

    const billingPartyId = new mongoose.Types.ObjectId(billing_party._id);

    const newEntry = await Entry.create({
        ...rest,
        billing_party: billingPartyId,
        extra_charges: charges
    });
    if (!newEntry) {
        return next(new AppError("Failed to create new entry", 400))
    }

    return successResponse(res, "Entry Added Successfully");
}

const getAllBillingEntries = async (req, res) => {
    const entries = await Entry.find().populate("billing_party").sort({ createdAt: -1 });

    return successResponse(res, "", entries);
}

const updateBillingEntry = async (req, res, next) => {
    const entryId = req.params.id;
    const updatedEntry = req.body;

    const { extra_charges, ...rest } = updatedEntry;
    const charges = [];

    const { lr_no, date, consignor, consignee, billing_party } = rest;
    const errors = {};
    if (!billing_party || !billing_party._id) errors.billing_party = "Billing party is required";
    if (!lr_no) errors.lr_no = "LR Number is required";
    if (!date) errors.date = "Date is required";
    if (!consignor) errors.consignor = "Consignor is required";
    if (!consignee) errors.consignee = "Consignee is required";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: "fail", errors });
    }

    if (Array.isArray(extra_charges)) {
        extra_charges.forEach((charge) => {
            charges.push({
                type: charge.type,
                amount: charge.amount,
                rate: charge.rate,
                per_amount: charge.per_amount
            });
        });
    }

    if (!mongoose.Types.ObjectId.isValid(entryId)) {
        return next(new AppError("Invalid Entry ID", 400));
    }

    const entry = await Entry.findByIdAndUpdate(entryId, { ...rest, extra_charges: charges }, { new: true }).populate("billing_party");

    if (!entry) {
        return next(new AppError("Entry not found", 404));
    }

    return successResponse(res, "Entry Updated Successfully", entry);
}

const searchBillingEntryByParam = async (req, res, next) => {
    const query = {};

    for (const [key, value] of Object.entries(req.query)) {
        if (!value) continue;

        const values = value.split(",").map((v) => v.trim());
        query[key] = {
            $in: values.map((v) => new RegExp(v, "i"))
        };
    }

    const entries = await Entry.find(query).populate("billing_party");

    if (!entries?.length) {
        return next(new AppError("Entry not found", 401));
    }

    return successResponse(res, "", entries);
}

const findBillingEntryById = async (req, res, next) => {
    const lrNumber = req.params.id;

    if (lrNumber.length < 0) {
        return next(new AppError("Please fill LR Number", 401));
    }

    const entry = await Entry.find({ lr_no: lrNumber }).populate("billing_party");

    if (!entry.length) {
        return next(new AppError("No entry found with the entered LR Number", 404));
    }

    return successResponse(res, "", entry);
}

export { addNewBillingEntry, getAllBillingEntries, updateBillingEntry, searchBillingEntryByParam, findBillingEntryById }