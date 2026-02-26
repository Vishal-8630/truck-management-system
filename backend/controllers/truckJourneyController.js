import { successResponse } from '../utils/response.js';
import Journey from '../models/truckJourneyModel.js';
import AppError from "../utils/appError.js";

const newJourney = async (req, res) => {
    const { truck, driver, from, to, journey_starting_cash, starting_kms, average_mileage } = req.body;

    const errors = {};
    if (!truck) errors.truck = "Truck is required";
    if (!driver) errors.driver = "Driver is required";
    if (!from) errors.from = "Starting point is required";
    if (!to) errors.to = "Destination is required";
    if (!starting_kms) errors.starting_kms = "Starting KMs is required";
    if (!average_mileage) errors.average_mileage = "Average mileage is required";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: "fail", errors });
    }

    const journey = await Journey.create({
        ...req.body
    });

    return successResponse(res, "Journey Added Successfully", journey);
};

const allJournies = async (req, res) => {
    const journies = await Journey.find({ is_deleted: false }).populate("truck").populate("driver");
    return successResponse(res, "", journies);
}

const updateJourney = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError("Journey ID is required", 400));
    }

    let journey = await Journey.findById(id);
    if (!journey || journey.is_deleted) {
        return next(new AppError("Journey not found", 404));
    }

    const { truck, driver, from, to, starting_kms, average_mileage } = req.body;
    const errors = {};
    if (req.body.hasOwnProperty('truck') && !truck) errors.truck = "Truck is required";
    if (req.body.hasOwnProperty('driver') && !driver) errors.driver = "Driver is required";
    if (req.body.hasOwnProperty('from') && !from) errors.from = "Starting point is required";
    if (req.body.hasOwnProperty('to') && !to) errors.to = "Destination is required";
    // For update, we only check if the property is present in req.body

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: "fail", errors });
    }

    Object.keys(req.body).forEach((key) => {
        if (typeof req.body[key] === "object" && !Array.isArray(req.body[key]) && req.body[key] !== null) {
            journey[key] = { ...journey[key], ...req.body[key] };
        } else {
            journey[key] = req.body[key];
        }
    });

    const updatedJourney = await journey.save();
    const populatedJourney = await Journey.findById(updatedJourney._id)
        .populate("truck")
        .populate("driver");
    return successResponse(res, "Journey Updated Successfully", populatedJourney);
}

const deleteJourney = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError("Journey ID is required", 400));
    }

    let journey = await Journey.findById(id);
    if (!journey || journey.is_deleted) {
        return next(new AppError("Journey not found", 404));
    }

    journey.is_deleted = true;
    const deletedJourney = await journey.save();
    return successResponse(res, "Journey Deleted Successfully", deletedJourney);
}

export { newJourney, allJournies, updateJourney, deleteJourney };