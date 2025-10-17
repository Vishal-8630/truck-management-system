import Driver from "../models/driverModel.js"
import { successResponse } from "../utils/response.js";

const newDriver = (req, res) => {
    const { truck, ...rest } = req.body;

    console.log("Driver: ", rest);
    return successResponse(res, "Driver Added Successfully");
}

const allDrivers = async (req, res) => {
    const drivers = await Driver.find().populate("truck").sort({ createdAt: -1 });

    return successResponse(res, "", drivers);
}

export { 
    newDriver,
    allDrivers
}