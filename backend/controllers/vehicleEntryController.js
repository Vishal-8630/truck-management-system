import VehicleEntry from "../models/vehicleEntryModel.js";
import BalanceParty from '../models/balanceParty.js';
import { successResponse } from "../utils/response.js";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";

const calculatePartyBalance = (entry) => {
    const totalBalance = Number(entry.freight) - (Number(entry.driver_cash) + Number(entry.dala) + Number(entry.kamisan) + Number(entry.in_ac) + Number(entry.halting));

    entry.balance = String(totalBalance);
    return entry;
}

const addNewVehicleEntry = async (req, res, next) => {
    let { _id, balance_party, ...rest } = req.body;
    if (!balance_party.party_name) {
        return next(new AppError("Party Name is required", 400));
    }

    rest = calculatePartyBalance(rest);

    const newEntry = await VehicleEntry.create({
        ...rest,
        balance_party: new mongoose.Types.ObjectId(balance_party._id)
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
    
    rest = calculatePartyBalance(rest);
    console.log(rest);
    console.log(entryId);
    const entry = await VehicleEntry.findByIdAndUpdate(entryId, { balance_party, ...rest}, { new: true }).populate("balance_party");
    console.log(entry);
    if (!entry) {
        return next(new AppError("Entry not found", 404));
    }
    return successResponse(res, "Entry Updated Successfully", entry);
}

export { addNewVehicleEntry, getAllVehicleEntries, searchVehicleEntryByParty, updateVehicleEntry }