import Driver from '../models/driverModel.js';
import Settlement from '../models/settlementModel.js';
import TruckJourney from '../models/truckJourneyModel.js';
import AppError from '../utils/appError.js';
import { successResponse } from '../utils/response.js';
import mongoose from 'mongoose';

const toNum = v => {
    if (v === undefined || v === null || v === "") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

export const previewSettlement = async (req, res, next) => {
    try {
        const { driverId, from, to } = req.query;
        if (!driverId || !from || !to) {
            return next(new AppError("Driver ID, From and To are required", 400));
        }

        const includeSettled = String(req.query.includeSettled || "false") === "true";

        const RATE_PER_KM = toNum(req.query.ratePerKm) || 3;
        const DIESEL_RATE = toNum(req.query.dieselRate) || 86;
        const EXTRA_EXPENSE = toNum(req.query.extraExpense) || 0;

        const q = {
            driver: driverId,
            is_deleted: false,
            journey_start_date: { $gte: from },
            journey_end_date: { $lte: to }
        };

        if (!includeSettled) {
            q.settled = false;
        }

        const journeys = await TruckJourney.find(q).populate("truck").populate("driver").lean();

        if (!journeys.length) {
            return successResponse(res, "No journeys found in the given period", {
                journeys: [],
                totals: {
                    total_driver_expense: 0,
                    total_diesel_expense: 0,
                    total_diesel_quantity: 0,
                    total_distance: 0,
                    avg_mileage: 0,
                    total_diesel_used: 0,
                    diesel_diff: 0,
                    diesel_value: 0,
                }
            });
        }

        let totalDriverExpense = 0;
        let totalDieselExpense = 0;
        let totalDieselQty = 0;
        let totalDistance = 0;
        let totalAvgMileageSum = 0;
        let mileageCount = 0;
        let totalJourneyGivenCash = 0;
        let totalRatePerKm = 0;

        for (const j of journeys) {
            totalDriverExpense += toNum(j.total_driver_expense);
            totalDieselExpense += toNum(j.total_diesel_expense);
            totalAvgMileageSum += toNum(j.average_mileage);
            totalJourneyGivenCash += toNum(j.journey_starting_cash);

            if (j.average_mileage) mileageCount++;

            const start = toNum(j.starting_kms);
            const end = toNum(j.ending_kms);
            const dist = Math.max(end - start, 0);
            totalDistance += dist;

            if (Array.isArray(j.diesel_expenses)) {
                for (const d of j.diesel_expenses) {
                    totalDieselQty += toNum(d.quantity);
                }
            }
        }

        const avgMileage = mileageCount ? (totalAvgMileageSum / mileageCount) : (toNum(req.query.defaultMileage) || 1);
        const totalDieselUsed = avgMileage ? (totalDistance / avgMileage) : 0;
        const dieselDiff = totalDieselUsed - totalDieselQty;
        const dieselValue = dieselDiff * DIESEL_RATE;

        const fuelMoneyAdjustment = dieselDiff * avgMileage;
        console.log("Total Distance: ", totalDistance);
        console.log("Rate per KM: ", RATE_PER_KM);
        totalRatePerKm = (totalDistance * RATE_PER_KM);

        let driverTotal = totalRatePerKm + totalDriverExpense;
        let ownerTotal = totalJourneyGivenCash;

        if (dieselDiff > 0) {
            driverTotal += dieselValue;
        } else {
            ownerTotal += (-dieselValue);
        }

        if (EXTRA_EXPENSE > 0) {
            ownerTotal += EXTRA_EXPENSE;
        } else {
            driverTotal += EXTRA_EXPENSE;
        }

        const overallTotal = ownerTotal - driverTotal;

        const result = {
            journeys: journeys.map(j => ({ ...j })),
            totals: {
                total_driver_expense: Number(totalDriverExpense.toFixed(2)),
                total_diesel_expense: Number(totalDieselExpense.toFixed(2)),
                total_diesel_quantity: Number(totalDieselQty.toFixed(2)),
                total_journey_starting_cash: Number(totalJourneyGivenCash.toFixed(2)),
                total_distance: Number(totalDistance.toFixed(2)),
                total_rate_per_km: Number(totalRatePerKm.toFixed(2)),
                avg_mileage: Number(avgMileage.toFixed(2)),
                total_diesel_used: Number(totalDieselUsed.toFixed(2)),
                diesel_diff: Number(dieselDiff.toFixed(2)),
                diesel_value: Number(dieselValue.toFixed(2)),
                driver_total: Number(driverTotal.toFixed(2)),
                owner_total: Number(ownerTotal.toFixed(2)),
                overall_total: Number(overallTotal.toFixed(2)),
                fuelMoneyAdjustment: Number(fuelMoneyAdjustment.toFixed(2)),
                extra_expense: EXTRA_EXPENSE,
                rate_per_km: RATE_PER_KM,
                diesel_rate: DIESEL_RATE,
            }
        }

        return successResponse(res, "Success", result);
    } catch (error) {
        console.log("Error in previewSettlement: ", error);
        next(error);
    }
}

export const confirmSettlement = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const {
            data, period, driver
        } = req.body;

        const { journeys, totals } = data;

        if (!driver) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError("Driver ID, From and To are required", 400));
        }

        if (!journeys.length) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError("No journeys found to settle", 400));
        }

        // create DriverSettlement doc (snapshot)
        const settlementDoc = await Settlement.create([{
            driver: driver._id,
            period: { from, to },
            journeys: journeys.map(j => j._id),

            total_driver_expense: Number(totals.total_driver_expense.toFixed(2)),
            total_diesel_expense: Number(totals.total_diesel_expense.toFixed(2)),
            total_diesel_quantity: Number(totals.total_diesel_quantity.toFixed(2)),
            total_journey_starting_cash: Number(totals.total_journey_starting_cash.toFixed(2)),
            total_distance: Number(totals.total_distance.toFixed(2)),
            total_rate_per_km: Number(totals.total_rate_per_km.toFixed(2)),
            avg_mileage: Number(totals.avg_mileage.toFixed(2)),

            total_diesel_used: Number(totals.total_diesel_used.toFixed(2)),
            diesel_diff: Number(totals.diesel_diff.toFixed(2)),
            diesel_value: Number(totals.diesel_value.toFixed(2)),
            final_amount: Number(totals.final_amount.toFixed(2)),

            driver_total: Number(totals.driver_total.toFixed(2)),
            owner_total: Number(totals.owner_total.toFixed(2)),
            overall_total: Number(totals.overall_total.toFixed(2)),

            extra_expense: Number(totals.extra_expense.toFixed(2)),
            rate_per_km: Number(totals.rate_per_km.toFixed(2)),
            diesel_rate: Number(totals.diesel_rate.toFixed(2)),

            status: totals.final_amount > 0 ? "Paid to Driver" : "Received from Driver",
        }], { session });

        const savedSettlement = settlementDoc[0];

        // mark journeys settled and link them
        const journeyIdsToUpdate = journeys.map(j => j._id);
        await TruckJourney.updateMany(
            { _id: { $in: journeyIdsToUpdate } },
            { $set: { settled: true, settlement_ref: savedSettlement._id } },
            { session }
        );

        // If finalAmount > 0 -> company pays driver -> increase driver's last_payment fields, adjust amount_to_receive/amount_to_pay
        const finalAbs = Math.abs(finalAmount);
        const isCompanyPays = finalAmount > 0;

        const updates = {};
        const today = (new Date()).toISOString().split("T")[0];

        updates.last_payment_clear_date = today;
        updates.last_payment_amount = String(Number(finalAbs.toFixed(2)));

        if (isCompanyPays) {
            // company owes the driver -> set amount_to_pay
            updates.amount_to_pay = String(Number(finalAbs.toFixed(2)));
            updates.amount_to_receive = "0";
        } else {
            // driver owes company
            updates.amount_to_receive = String(Number(finalAbs.toFixed(2)));
            updates.amount_to_pay = "0";
        }

        // reset advance amount after settlement (depends on your policy)
        updates.advance_amount = "0";

        await Driver.findByIdAndUpdate(driver._id, { $set: updates }, { session });

        await session.commitTransaction();
        session.endSession();

        return successResponse(res, "Settlement Created Successfully", savedSettlement);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};