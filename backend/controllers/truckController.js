import { deleteFromS3 } from '../middlewares/uploadMiddleware.js';
import Truck from '../models/truckModel.js';
import AppError from '../utils/appError.js';
import { successResponse } from '../utils/response.js';
import { getSignedS3Url } from "../middlewares/s3Helper.js";
import safeJSONParse from '../utils/safeJSONParse.js';

const newTruck = async (req, res, next) => {
    try {
        const {
            truck_no,
            fitness_doc_expiry,
            insurance_doc_expiry,
            national_permit_doc_expiry,
            state_permit_doc_expiry,
            tax_doc_expiry,
            pollution_doc_expiry
        } = req.body;

        if (!truck_no) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("Truck No is required", 400));
        }

        if (!fitness_doc_expiry || !insurance_doc_expiry || !national_permit_doc_expiry || !state_permit_doc_expiry || !tax_doc_expiry || !pollution_doc_expiry) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("All Dates are required", 400));
        }

        const getFile = (key) => req.files?.[key]?.[0]?.location || null;
        let parsedDrivers = [];
        if (req.body.drivers) {
            parsedDrivers = JSON.parse(req.body.drivers);
        }

        const truckData = {
            truck_no,
            fitness_doc_expiry,
            insurance_doc_expiry,
            national_permit_doc_expiry,
            state_permit_doc_expiry,
            tax_doc_expiry,
            pollution_doc_expiry,
            drivers: parsedDrivers,
            fitness_doc: getFile("fitness_doc"),
            insurance_doc: getFile("insurance_doc"),
            national_permit_doc: getFile("national_permit_doc"),
            state_permit_doc: getFile("state_permit_doc"),
            tax_doc: getFile("tax_doc"),
            pollution_doc: getFile("pollution_doc"),
        };

        const existingTruck = await Truck.findOne({ truck_no });
        if (existingTruck) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("Truck No already exist in database", 400));
        }

        const truck = new Truck(truckData);
        await truck.save();

        return successResponse(res, "Truck Added Successfully");
    } catch (error) {
        console.log("Error adding truck", error);
        if (req.files) await deleteFromS3(req.files);
        return next(new AppError("Something went wrong while adding truck", 500));
    }
}

const allTrucks = async (req, res) => {
    const trucks = await Truck.find({ is_deleted: false }).populate("drivers").sort({ createdAt: -1 });

    const signedTrucks = await Promise.all(
        trucks.map(async (truck) => ({
            ...truck._doc,
            fitness_doc: await getSignedS3Url(truck.fitness_doc),
            insurance_doc: await getSignedS3Url(truck.insurance_doc),
            national_permit_doc: await getSignedS3Url(truck.national_permit_doc),
            state_permit_doc: await getSignedS3Url(truck.state_permit_doc),
            tax_doc: await getSignedS3Url(truck.tax_doc),
            pollution_doc: await getSignedS3Url(truck.pollution_doc)
        }))
    )
    return successResponse(res, "", signedTrucks);
}

const updateTruck = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("Truck ID is required", 400));
        }

        const truck = await Truck.findById(id);
        if (!truck) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("Truck not found", 404));
        }

        const {
            truck_no,
            fitness_doc_expiry,
            insurance_doc_expiry,
            national_permit_doc_expiry,
            state_permit_doc_expiry,
            tax_doc_expiry,
            pollution_doc_expiry,
            changedDocuments
        } = req.body;

        if (!truck_no) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("Truck No is required", 400));
        }

        if (!fitness_doc_expiry || !insurance_doc_expiry || !national_permit_doc_expiry || !state_permit_doc_expiry || !tax_doc_expiry || !pollution_doc_expiry) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("All Dates are required", 400));
        }

        const getFile = (key) => req.files?.[key]?.[0]?.location || null;
        let parsedDrivers = [];
        if (req.body.drivers) {
            parsedDrivers = JSON.parse(req.body.drivers);
        }

        const truckData = {
            truck_no,
            fitness_doc_expiry,
            insurance_doc_expiry,
            national_permit_doc_expiry,
            state_permit_doc_expiry,
            tax_doc_expiry,
            pollution_doc_expiry,
            drivers: parsedDrivers
        };

        Object.keys(truckData).forEach((key) => {
            const value = truckData[key];

            if (typeof value === "object" && !Array.isArray(value) && value !== null) {
                truck[key] = { ...truck[key], ...value };
            } else {
                truck[key] = value;
            }
        });

        const changedDocs = safeJSONParse(changedDocuments, []);
        changedDocs.forEach((key) => {
            if (key === "fitness_doc") {
                truck.fitness_doc = getFile(key);
            } else if (key === "insurance_doc") {
                truck.insurance_doc = getFile(key);
            } else if (key === "national_permit_doc") {
                truck.national_permit_doc = getFile(key);
            } else if (key === "state_permit_doc") {
                truck.state_permit_doc = getFile(key);
            } else if (key === "tax_doc") {
                truck.tax_doc = getFile(key);
            } else if (key === "pollution_doc") {
                truck.pollution_doc = getFile(key);
            }
        });

        const updatedTruck = await truck.save();
        const signedTruck = {
            ...updatedTruck._doc,
            fitness_doc: await getSignedS3Url(updatedTruck.fitness_doc),
            insurance_doc: await getSignedS3Url(updatedTruck.insurance_doc),
            national_permit_doc: await getSignedS3Url(updatedTruck.national_permit_doc),
            state_permit_doc: await getSignedS3Url(updatedTruck.state_permit_doc),
            tax_doc: await getSignedS3Url(updatedTruck.tax_doc),
            pollution_doc: await getSignedS3Url(updatedTruck.pollution_doc)
        };

        return successResponse(res, "Truck Updated Successfully", signedTruck);
    } catch (error) {
        console.log("Error adding truck", error);
        if (req.files) await deleteFromS3(req.files);
        return next(new AppError("Something went wrong while adding truck", 500));
    }
}

const deleteTruck = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError("Truck ID is required", 400));
    }

    let truck = await Truck.findById(id);
    if (!truck) {
        return next(new AppError("Truck not found", 404));
    }

    truck.is_deleted = true;
    const deletedTruck = await truck.save();
    return successResponse(res, "Truck Deleted Successfully", deletedTruck);
}

export { newTruck, allTrucks, updateTruck, deleteTruck };