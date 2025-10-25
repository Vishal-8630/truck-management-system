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
    const journies = await Journey.find().populate("truck").populate("driver");
    return successResponse(res, "", journies);
}

export { newJourney, allJournies };