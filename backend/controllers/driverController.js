import Driver from "../models/driverModel.js"
import { successResponse } from "../utils/response.js";
import AppError from '../utils/appError.js';
import { deleteFromS3 } from "../middlewares/uploadMiddleware.js";
import { getSignedS3Url } from "../middlewares/s3Helper.js";

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
            console.log("existingDriver: ", existingDriver);
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
    const drivers = await Driver.find().populate("vehicles").sort({ createdAt: -1 });

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

export {
    newDriver,
    allDrivers
}