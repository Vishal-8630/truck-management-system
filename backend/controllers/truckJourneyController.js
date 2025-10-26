import { successResponse } from '../utils/response.js';
import Journey from '../models/truckJourneyModel.js';

const newJourney = async (req, res) => {
    const { truck, driver, from, to, journey_days, distance_km } = req.body;

    const journey = await Journey.create({
        truck,
        driver,
        from,
        to,
        journey_days,
        distance_km
    });

    return successResponse(res, "Journey Added Successfully", journey);
};

const allJournies = async (req, res) => {
    const journies = await Journey.find({ is_deleted: true }).populate("truck").populate("driver");
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

    Object.keys(req.body).forEach((key) => {
        if (typeof req.body[key] === "object" && !Array.isArray(req.body[key]) && req.body[key] !== null) {
            journey[key] = {...journey[key], ...req.body[key] };
        } else {
            journey[key] = req.body[key];
        }
    });

    const updatedJourney = await journey.save();
    return successResponse(res, "Journey Updated Successfully", updatedJourney);
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