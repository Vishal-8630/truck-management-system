import Driver from "../models/driverModel.js"
import { successResponse } from "../utils/response.js";
import AppError from '../utils/appError.js';
import { deleteFromS3 } from "../middlewares/uploadMiddleware.js";
import { getSignedS3Url } from "../middlewares/s3Helper.js";
import safeJSONParse from "../utils/safeJSONParse.js";

const newDriver = async (req, res, next) => {
    try {
        const { name, address, phone, home_phone, adhaar_no, dl } = req.body;

        if (!name || !phone || !adhaar_no || !dl) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("All required fields must be provided", 400));
        }

        const getFile = (key) => req.files?.[key]?.[0]?.location || null;
        let parsedVehicles = [];
        if (req.body.vehicles) {
            parsedVehicles = JSON.parse(req.body.vehicles);
        }

        const driverData = {
            name,
            address,
            phone,
            home_phone,
            adhaar_no,
            dl,
            driver_img: getFile("driver_img"),
            adhaar_front_img: getFile("adhaar_front_img"),
            adhaar_back_img: getFile("adhaar_back_img"),
            dl_img: getFile("dl_img"),
            vehicles: parsedVehicles
        };

        const existingDriver = await Driver.findOne({
            $or: [{ adhaar_no }, { dl }, { phone }],
        });

        if (existingDriver) {
            if (req.files) await deleteFromS3(req.files);
            let field =
                existingDriver.adhaar_no === adhaar_no
                    ? "Adhaar Number"
                    : existingDriver.dl === dl
                        ? "Driving License"
                        : "Phone Number";
            return next(new AppError(`Driver with this ${field} already exists`, 400));
        }

        const newDriver = await Driver.create(driverData);
        return successResponse(res, "Driver Added Successfully", newDriver);

    } catch (error) {
        console.error("Error adding driver:", error);
        if (req.files) await deleteFromS3(req.files);
        return next(new AppError("Something went wrong while adding driver", 500));
    }
};

const allDrivers = async (req, res) => {
    const drivers = await Driver.find({ is_deleted: false }).populate("vehicles").sort({ createdAt: -1 });

    const signedDrivers = await Promise.all(
        drivers.map(async (driver) => ({
            ...driver._doc,
            driver_img: await getSignedS3Url(driver.driver_img),
            adhaar_front_img: await getSignedS3Url(driver.adhaar_front_img),
            adhaar_back_img: await getSignedS3Url(driver.adhaar_back_img),
            dl_img: await getSignedS3Url(driver.dl_img),
        }))
    );

    return successResponse(res, "", signedDrivers);
}

const updateDriver = async (req, res, next) => {
    try {
        const { id } = req.params;
        const getFile = (key) => req.files?.[key]?.[0]?.location || null;

        if (!id) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("Driver ID is required", 400));
        }

        const driver = await Driver.findById(id);
        if (!driver) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("Driver not found", 404));
        }

        const { name, address, phone, home_phone, adhaar_no, dl, changedDocuments } = req.body;

        if (!name || !phone || !adhaar_no || !dl) {
            if (req.files) await deleteFromS3(req.files);
            return next(new AppError("All required fields must be provided", 400));
        }

        const existingDriver = await Driver.findOne({
            $or: [{ adhaar_no }, { dl }, { phone }],
        });

        if (existingDriver._id.toString() !== id) {
            if (req.files) await deleteFromS3(req.files);
            let field =
                existingDriver.adhaar_no === adhaar_no
                    ? "Adhaar Number"
                    : existingDriver.dl === dl
                        ? "Driving License"
                        : "Phone Number";
            return next(new AppError(`Driver with this ${field} already exists`, 400));
        }

        let parsedVehicles = [];
        if (req.body.vehicles) {
            parsedVehicles = JSON.parse(req.body.vehicles);
        }

        const driverData = {
            name,
            address,
            phone,
            home_phone,
            adhaar_no,
            dl,
            vehicles: parsedVehicles
        };

        Object.keys(driverData).forEach((key) => {
            const value = driverData[key];

            if (typeof value === "object" && !Array.isArray(value) && value !== null) {
                driver[key] = { ...driver[key], ...value };
            } else {
                driver[key] = value;
            }
        });

        let changedDocs = safeJSONParse(changedDocuments, []);
        changedDocs.forEach((key) => {
            if (key === 'driver_img') {
                driver.driver_img = getFile("driver_img");
            } else if (key === 'adhaar_front_img') {
                driver.adhaar_front_img = getFile("adhaar_front_img");
            } else if (key === 'adhaar_back_img') {
                driver.adhaar_back_img = getFile("adhaar_back_img");
            } else if (key === 'dl_img') {
                driver.dl_img = getFile("dl_img");
            }
        });

        const updatedDriver = await driver.save();
        const signedDrivers = {
            ...updatedDriver._doc,
            driver_img: await getSignedS3Url(updatedDriver.driver_img),
            adhaar_front_img: await getSignedS3Url(updatedDriver.adhaar_front_img),
            adhaar_back_img: await getSignedS3Url(updatedDriver.adhaar_back_img),
            dl_img: await getSignedS3Url(updatedDriver.dl_img),
        }

        return successResponse(res, "Driver Updated Successfully", signedDrivers);
    } catch (error) {
        console.error("Error updating driver:", error);
        if (req.files) await deleteFromS3(req.files);
        return next(new AppError("Something went wrong while updating driver", 500));
    }
}

const deleteDriver = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError("Driver ID is required", 400));
    }

    let driver = await Driver.findById(id);
    if (!driver) {
        return next(new AppError("Driver not found", 404));
    }

    driver.is_deleted = true;
    const deletedDriver = await driver.save();
    return successResponse(res, "Driver Deleted Successfully", deletedDriver);
}

export {
    newDriver,
    allDrivers,
    updateDriver,
    deleteDriver
}