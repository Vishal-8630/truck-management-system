import VehicleEntry from "../models/vehicleEntryModel.js";
import BalanceParty from '../models/balanceParty.js';
import { successResponse } from "../utils/response.js";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";
import logAuditEvent from "../utils/audit/logAuditEvent.js";
import { prepareAuditSnapshot } from "../utils/audit/auditHelpers.js";

const calculatePartyBalance = (entry) => {
    const totalBalance = Number(entry.freight) - (Number(entry.driver_cash) + Number(entry.dala) + Number(entry.kamisan) + Number(entry.in_ac) + Number(entry.halting));

    entry.balance = String(totalBalance);
    return entry;
}

const addNewVehicleEntry = async (req, res, next) => {
    let { _id, balance_party, ...rest } = req.body;
    const { vehicle_no, date, from, to } = rest;
    const errors = {};
    if (!balance_party.party_name) errors.party_name = "Party Name is required";
    if (!vehicle_no) errors.vehicle_no = "Vehicle Registration is required";
    if (!date) errors.date = "Log Date is required";
    if (!from) errors.from = "Origin City is required";
    if (!to) errors.to = "Destination City is required";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: "fail", errors });
    }

    rest = calculatePartyBalance(rest);
    const newEntry = await VehicleEntry.create({
        ...rest,
        balance_party: new mongoose.Types.ObjectId(balance_party._id)
    });

    const populatedAfter = await VehicleEntry.findById(newEntry._id).populate("balance_party").lean();

    await logAuditEvent({
        req,
        entityType: "vehicle_entry",
        entityId: newEntry._id,
        action: "create",
        before: {},
        after: prepareAuditSnapshot(populatedAfter, { balance_party: "balance_party" }),
    });
    if (!newEntry) {
        return next(new AppError("Failed to create new entry", 400))
    }
    return successResponse(res, "Vehicle Entry Added Successfully");
}

const getAllVehicleEntries = async (req, res) => {
    const vehicleEntries = await VehicleEntry.find().populate("balance_party").sort({ createdAt: -1 });
    return successResponse(res, "", vehicleEntries);
}

const searchVehicleEntryByParty = async (req, res) => {
    const partyId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
        return next(new AppError("Invalid Party ID", 400));
    }

    const vehicleEntries = await VehicleEntry.find({ balance_party: partyId }).populate("balance_party");
    return successResponse(res, "", vehicleEntries);
}

const updateVehicleEntry = async (req, res) => {
    const entryId = req.params.id;
    let { _id, balance_party, ...rest } = req.body;

    if (!mongoose.Types.ObjectId.isValid(entryId)) {
        return next(new AppError("Invalid Entry ID", 400));
    }

    const beforeEntry = await VehicleEntry.findById(entryId).populate("balance_party").lean();
    rest = calculatePartyBalance(rest);
    const entry = await VehicleEntry.findByIdAndUpdate(entryId, { balance_party, ...rest }, { new: true }).populate("balance_party");

    if (!entry) {
        return next(new AppError("Entry not found", 404));
    }
    await logAuditEvent({
        req,
        entityType: "vehicle_entry",
        entityId: entry._id,
        action: "update",
        before: prepareAuditSnapshot(beforeEntry, { balance_party: "balance_party" }),
        after: prepareAuditSnapshot(entry, { balance_party: "balance_party" }),
    });
    return successResponse(res, "Entry Updated Successfully", entry);
}

export { addNewVehicleEntry, getAllVehicleEntries, searchVehicleEntryByParty, updateVehicleEntry }