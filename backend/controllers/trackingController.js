import Entry from "../models/billingEntryModel.js";
import TruckJourney from "../models/truckJourneyModel.js";

/**
 * @desc    Track shipment by LR number
 * @route   GET /api/tracking/:lr_no
 * @access  Public
 */
export const trackShipment = async (req, res) => {
    try {
        const { lr_no } = req.params;

        if (!lr_no) {
            return res.status(400).json({ message: "LR Number is required" });
        }

        // 1. Find the Bill Entry (LR)
        const entry = await Entry.findOne({ lr_no: lr_no.trim() });

        if (!entry) {
            return res.status(404).json({ message: "Shipment not found with this LR number" });
        }

        // 2. Find if there's an active journey for this vehicle
        let journeyInfo = null;
        if (entry.vehicle_no) {
            // Find the most recent active or completed journey for this truck
            const journey = await TruckJourney.findOne({
                status: { $in: ["Active", "Completed"] },
                // We try to match transit details
                from: entry.from,
                to: entry.to
            }).sort({ createdAt: -1 }).populate("truck");

            if (journey) {
                // Find last known location from daily progress
                const lastProgress = [...(journey.daily_progress || [])]
                    .reverse()
                    .find(p => p.location && p.location.trim() !== "");

                journeyInfo = {
                    status: journey.status,
                    current_location: lastProgress ? lastProgress.location : "Origin Terminal",
                    last_updated: lastProgress ? lastProgress.date : journey.journey_start_date,
                    eta: journey.journey_end_date
                };
            }
        }

        // 3. Construct minimized response
        const publicData = {
            lr_no: entry.lr_no,
            booking_date: entry.lr_date,
            origin: entry.from,
            destination: entry.to,
            status: journeyInfo?.status || "Processing",
            last_location: journeyInfo?.current_location || "Booking Center",
            last_update: journeyInfo?.last_updated || entry.lr_date,
            estimated_delivery: journeyInfo?.eta || "TBD"
        };

        res.status(200).json(publicData);
    } catch (error) {
        console.error("Tracking Error:", error);
        res.status(500).json({ message: "Error retrieving tracking information" });
    }
};
