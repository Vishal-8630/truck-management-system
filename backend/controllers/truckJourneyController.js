import { successResponse } from '../utils/response.js';
import Journey from '../models/truckJourneyModel.js';
import Ledger from '../models/ledgerModel.js';
import AppError from "../utils/appError.js";
import { sendWhatsApp, WA } from '../utils/sendWhatsApp.js';

const newJourney = async (req, res) => {
    const { truck, driver, from, to, starting_kms, average_mileage } = req.body;
    const errors = {};
    if (!truck) errors.truck = "Truck is required";
    if (!driver) errors.driver = "Driver is required";
    if (!from) errors.from = "Starting point is required";
    if (!to) errors.to = "Destination is required";
    if (!starting_kms) errors.starting_kms = "Starting KMs is required";
    if (!average_mileage) errors.average_mileage = "Average mileage is required";
    if (Object.keys(errors).length > 0) return res.status(400).json({ status: "fail", errors });

    const journey = await Journey.create({ ...req.body });
    const populated = await Journey.findById(journey._id).populate('truck').populate('driver').lean();
    sendWhatsApp(WA.newJourney(populated)); // fire-and-forget
    return successResponse(res, "Journey Added Successfully", journey);
};

const allJournies = async (req, res) => {
    const journies = await Journey.find({ is_deleted: false }).populate("truck").populate("driver");
    return successResponse(res, "", journies);
}

const updateJourney = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return next(new AppError("Journey ID is required", 400));

        let journey = await Journey.findById(id);
        if (!journey || journey.is_deleted) return next(new AppError("Journey not found", 404));

        const errors = {};
        // Validation logic
        if (req.body.journey_settlement_status === "Settled") {
            const incomingSettlement = req.body.settlement || {};
            const mergedAmountPaid = incomingSettlement.amount_paid ?? journey.settlement?.amount_paid;
            const mergedDatePaid = incomingSettlement.date_paid ?? journey.settlement?.date_paid;
            if (!mergedAmountPaid || String(mergedAmountPaid).trim() === "" || String(mergedAmountPaid).trim() === "0") {
                errors["settlement.amount_paid"] = "Final Paid Amount is required before marking as Settled.";
            }
            if (!mergedDatePaid || String(mergedDatePaid).trim() === "") {
                errors["settlement.date_paid"] = "Payment Date is required before marking as Settled.";
            }
        }
        if (Object.keys(errors).length > 0) return res.status(400).json({ status: "fail", errors });

        // Backup old states
        const prevSettlementStatus = journey.journey_settlement_status;
        const prevPartyPaymentStatus = journey.party_payment_status;

        // Apply updates
        Object.keys(req.body).forEach((key) => {
            if (['truck', 'driver', '_id', '__v', 'createdAt', 'updatedAt'].includes(key)) return;
            if (typeof req.body[key] === "object" && !Array.isArray(req.body[key]) && req.body[key] !== null) {
                journey[key] = { ...journey[key]?.toObject?.() || journey[key], ...req.body[key] };
            } else {
                journey[key] = req.body[key];
            }
        });

        // --- Automation Unlinked ---
        // (Previously forced status Change here)

        const updatedJourney = await journey.save();
        const populatedJourney = await Journey.findById(updatedJourney._id).populate("truck").populate("driver").lean();

        // --- Ledger Automation ---
        const truckId = populatedJourney.truck?._id || populatedJourney.truck;
        const driverId = populatedJourney.driver?._id || populatedJourney.driver;
        const journeyId = populatedJourney._id;

        // 1. Driver Settlement Sync
        if (populatedJourney.journey_settlement_status === "Settled") {
            const amountPaid = parseFloat(populatedJourney.settlement?.amount_paid) || 0;
            const mode = populatedJourney.settlement?.mode || "Cash";
            const datePaid = populatedJourney.settlement?.date_paid ? new Date(populatedJourney.settlement.date_paid) : new Date();

            const ledgerData = {
                date: isNaN(datePaid.getTime()) ? new Date() : datePaid,
                journey: journeyId,
                truck: truckId,
                driver: driverId,
                category: "Journey Settlement",
                transaction_type: "Driver Settlement",
                description: `Journey Settled: ${populatedJourney.truck?.truck_no || "N/A"} | ${populatedJourney.from} → ${populatedJourney.to} | ₹${amountPaid}`,
                debit: amountPaid,
                credit: 0,
                amount: amountPaid,
                balance_type: "Debit",
                payment_mode: ["Cash", "Bank", "UPI", "Cheque", "Credit"].includes(mode) ? mode : "Cash",
                notes: populatedJourney.settlement?.remarks || "",
                is_auto_generated: true,
                meta: { journey_id: journeyId.toString() }
            };

            // Remove any old auto-generated settlement record for this journey to ensure fresh sync
            await Ledger.deleteMany({
                journey: journeyId,
                is_auto_generated: true,
                category: "Journey Settlement"
            });
            await Ledger.create(ledgerData);

        } else if (prevSettlementStatus === "Settled" && populatedJourney.journey_settlement_status !== "Settled") {
            // If it was settled but now it's not, wipe the ledger entry
            await Ledger.deleteMany({
                journey: journeyId,
                is_auto_generated: true,
                category: "Journey Settlement"
            });
        }

        // 2. Party Payment Sync
        if (populatedJourney.party_payment_status === "Paid") {
            const dateReceived = populatedJourney.party_payment_received_date ? new Date(populatedJourney.party_payment_received_date) : new Date();
            const ledgerData = {
                date: isNaN(dateReceived.getTime()) ? new Date() : dateReceived,
                journey: journeyId,
                truck: truckId,
                driver: driverId,
                category: "Payment Received",
                transaction_type: "Journey",
                description: `Party Payment: ${populatedJourney.truck?.truck_no || "N/A"} | ${populatedJourney.from} → ${populatedJourney.to}`,
                debit: 0,
                credit: 0,
                amount: 0,
                balance_type: "Credit",
                payment_mode: "Cash",
                is_auto_generated: true,
                meta: { journey_id: journeyId.toString() }
            };

            await Ledger.deleteMany({
                journey: journeyId,
                is_auto_generated: true,
                category: "Payment Received"
            });
            await Ledger.create(ledgerData);

        } else if (prevPartyPaymentStatus === "Paid" && populatedJourney.party_payment_status !== "Paid") {
            await Ledger.deleteMany({
                journey: journeyId,
                is_auto_generated: true,
                category: "Payment Received"
            });
        }

        // Notify on settle
        if (populatedJourney.journey_settlement_status === 'Settled' && prevSettlementStatus !== 'Settled') {
            sendWhatsApp(WA.journeySettled(populatedJourney)); // fire-and-forget
        }

        return successResponse(res, "Journey Updated Successfully", populatedJourney);
    } catch (err) {
        next(err);
    }
}

const deleteJourney = async (req, res, next) => {
    const { id } = req.params;
    if (!id) return next(new AppError("Journey ID is required", 400));
    let journey = await Journey.findById(id);
    if (!journey || journey.is_deleted) return next(new AppError("Journey not found", 404));
    journey.is_deleted = true;
    const deletedJourney = await journey.save();
    return successResponse(res, "Journey Deleted Successfully", deletedJourney);
}

export { newJourney, allJournies, updateJourney, deleteJourney };