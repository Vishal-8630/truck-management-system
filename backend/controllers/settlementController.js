import Driver from '../models/driverModel.js';
import Settlement from '../models/settlementModel.js';
import TruckJourney from '../models/truckJourneyModel.js';
import Ledger from '../models/ledgerModel.js';
import AppError from '../utils/appError.js';
import { successResponse } from '../utils/response.js';
import mongoose from 'mongoose';
import { sendWhatsApp, WA } from '../utils/sendWhatsApp.js';
import logAuditEvent from "../utils/audit/logAuditEvent.js";

const toNum = v => {
    if (v === undefined || v === null || v === "") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

const calculateTotals = (journeys, ratePerKm, dieselRate, extraExpense, defaultMileage = 1) => {
    let totalDriverExpense = 0;
    let totalDieselExpense = 0;
    let totalDieselQty = 0;
    let totalDistance = 0;
    let totalAvgMileageSum = 0;
    let mileageCount = 0;
    let totalJourneyGivenCash = 0;

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

    const avgMileage = mileageCount ? (totalAvgMileageSum / mileageCount) : (toNum(defaultMileage) || 1);
    const totalDieselUsed = avgMileage ? Math.floor((totalDistance / avgMileage)) : 0;
    const dieselDiff = totalDieselUsed - totalDieselQty;
    let dieselValue = dieselDiff * dieselRate;

    const fuelMoneyAdjustment = dieselDiff * avgMileage;
    const totalRatePerKm = (totalDistance * ratePerKm);

    let driverTotal = totalRatePerKm + totalDriverExpense;
    let ownerTotal = totalJourneyGivenCash;

    if (dieselDiff > 0) {
        dieselValue = Math.floor(dieselValue);
        driverTotal += dieselValue;
    } else {
        dieselValue = Math.ceil(dieselValue);
        ownerTotal += (-dieselValue);
    }

    if (extraExpense > 0) {
        ownerTotal += extraExpense;
    } else {
        driverTotal += extraExpense;
    }

    const overallTotal = ownerTotal - driverTotal;

    return {
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
        extra_expense: extraExpense,
        rate_per_km: ratePerKm,
        diesel_rate: dieselRate,
    };
};

export const previewSettlement = async (req, res, next) => {
    try {
        const { driverId, from, to } = req.query;
        console.log(from, to);

        const errors = {};
        if (!driverId) errors.driverId = "Driver ID is required";
        if (!from) errors.from = "From Date is required";
        if (!to) errors.to = "To Date is required";
        if (!req.query.ratePerKm) errors.ratePerKm = "Rate Per Km is required";
        if (!req.query.dieselRate) errors.dieselRate = "Diesel Rate is required";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ status: "fail", errors });
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

        const totals = calculateTotals(journeys, RATE_PER_KM, DIESEL_RATE, EXTRA_EXPENSE, req.query.defaultMileage);

        const result = {
            journeys: journeys.map(j => ({ ...j })),
            totals
        }

        return successResponse(res, "Success", result);
    } catch (error) {
        console.log("Error in previewSettlement: ", error);
        next(error);
    }
}

export const confirmSettlement = async (req, res, next) => {
    try {
        const {
            data, period, driver
        } = req.body;

        const { journeys, totals } = data;

        if (!driver) {
            return next(new AppError("Driver ID, From and To are required", 400));
        }

        if (!journeys.length) {
            return next(new AppError("No journeys found to settle", 400));
        }

        // create DriverSettlement doc (snapshot)
        const savedSettlement = await Settlement.create({
            driver: driver._id,
            period: { from: period.from, to: period.to },
            journeys: journeys,

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

            driver_total: Number(totals.driver_total.toFixed(2)),
            owner_total: Number(totals.owner_total.toFixed(2)),
            overall_total: Number(totals.overall_total.toFixed(2)),

            extra_expense: Number(totals.extra_expense.toFixed(2)),
            rate_per_km: Number(totals.rate_per_km.toFixed(2)),
            diesel_rate: Number(totals.diesel_rate.toFixed(2)),

            payment_status: totals.overall_total === 0 ? "Balanced" : totals.overall_total > 0 ? "Driver needs to pay" : "DRL needs to pay",
            is_settled: false
        });
        await logAuditEvent({
            req,
            entityType: "settlement",
            entityId: savedSettlement._id,
            action: "create",
            before: {},
            after: savedSettlement.toObject(),
        });

        // mark journeys settled and link them
        const journeyIdsToUpdate = journeys.map(j => j._id);
        await TruckJourney.updateMany(
            { _id: { $in: journeyIdsToUpdate } },
            { $set: { settled: true, settlement_ref: savedSettlement._id } },
        );

        // If finalAmount > 0 -> company pays driver -> increase driver's last_payment fields, adjust amount_to_receive/amount_to_pay
        const finalAbs = Math.abs(totals.overall_total);
        const isCompanyPays = totals.overall_total > 0;

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

        await Driver.findByIdAndUpdate(driver._id, { $set: updates });

        // Ledger entry creation removed from here to prevent duplication with markSettled
        // Only markSettled will handle the official ledger record for the payout.



        return successResponse(res, "Settlement Created Successfully", savedSettlement);
    } catch (err) {
        console.log("Error in confirmSettlement: ", err);
        next(err);
    }
};

export const allSettlements = async (req, res, next) => {
    try {
        const settlements = await Settlement.find().populate("journeys").populate("driver");
        return successResponse(res, "Success", settlements);
    } catch (err) {
        console.log("Error in allSettlements: ", err);
        next(err);
    }
};

export const markSettled = async (req, res, next) => {
    try {
        const { id } = req.params;
        const today = new Date().toISOString().split("T")[0];

        const beforeSettlement = await Settlement.findById(id).lean();
        const settlement = await Settlement.findByIdAndUpdate(
            id,
            {
                $set: {
                    is_settled: true,
                    settled_at: today
                }
            },
            { new: true, runValidators: true }
        );

        if (!settlement) {
            return next(new AppError("Settlement not found", 404));
        }
        await logAuditEvent({
            req,
            entityType: "settlement",
            entityId: settlement._id,
            action: "status_change",
            before: beforeSettlement || {},
            after: settlement.toObject ? settlement.toObject() : settlement,
        });

        // --- AUTO-GENERATE/SYNC LEDGER ENTRY on markSettled ---
        try {
            const absTotal = Math.abs(settlement.overall_total || 0);
            const settlementId = settlement._id;

            // Always clean up existing records for this settlement to avoid duplicates
            await Ledger.deleteMany({
                settlement: settlementId,
                is_auto_generated: true
            });

            if (absTotal > 0) {
                const isDRLPays = settlement.payment_status === "DRL needs to pay";
                const paymentMode = settlement.payment_meta?.mode || "Cash";
                const paymentDate = settlement.payment_meta?.date
                    ? new Date(settlement.payment_meta.date)
                    : new Date();

                await Ledger.create({
                    date: isNaN(paymentDate.getTime()) ? new Date() : paymentDate,
                    settlement: settlementId,
                    driver: settlement.driver,
                    category: "Driver Settlement", // Standardized category
                    transaction_type: "Driver Settlement",
                    description: `Settlement Payout — ${settlement.driver?.name || 'Driver'} | ${settlement.payment_status} | ₹${absTotal} | Mode: ${paymentMode}`,
                    debit: isDRLPays ? absTotal : 0,
                    credit: isDRLPays ? 0 : absTotal,
                    amount: absTotal,
                    balance_type: isDRLPays ? "Debit" : "Credit",
                    payment_mode: ["Cash", "Bank", "UPI", "Cheque", "Credit"].includes(paymentMode) ? paymentMode : "Cash",
                    reference_no: settlement.payment_meta?.remarks || "",
                    notes: `Settlement Finalized. ID: ${settlementId}`,
                    is_auto_generated: true,
                    meta: {
                        settlement_id: settlementId.toString(),
                        driver_id: settlement.driver?.toString(),
                        payment_status: settlement.payment_status,
                    }
                });
            }
        } catch (ledgerErr) {
            console.error("Auto-ledger sync failed at markSettled:", ledgerErr.message);
        }

        // WhatsApp notification — settlement paid
        sendWhatsApp(WA.settlementPaid(settlement));

        return successResponse(res, "Settlement marked as settled successfully.", settlement);
    } catch (err) {
        console.log("Error in markSettled: ", err);
        next(err);
    }
};

export const unmarkSettled = async (req, res, next) => {
    try {
        const { id } = req.params;

        const beforeSettlement = await Settlement.findById(id).lean();
        const settlement = await Settlement.findByIdAndUpdate(
            id,
            {
                $set: {
                    is_settled: false,
                    settled_at: null
                }
            },
            { new: true, runValidators: true }
        );

        if (!settlement) {
            return next(new AppError("Settlement not found", 404));
        }
        await logAuditEvent({
            req,
            entityType: "settlement",
            entityId: settlement._id,
            action: "status_change",
            before: beforeSettlement || {},
            after: settlement.toObject ? settlement.toObject() : settlement,
        });

        // --- Clean up Ledger on Unsettle ---
        try {
            await Ledger.deleteMany({
                settlement: id,
                is_auto_generated: true
            });
        } catch (err) {
            console.error("Ledger cleanup failed at unmarkSettled:", err.message);
        }



        return successResponse(res, "Settlement marked as unsettled.", settlement);
    } catch (err) {
        console.log("Error in unmarkSettled: ", err);
        next(err);
    }
};

export const recalculateSettlement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const settlement = await Settlement.findById(id).populate("journeys");

        if (!settlement) {
            return next(new AppError("Settlement not found", 404));
        }

        if (settlement.is_settled) {
            return next(new AppError("Cannot recalculate a settled record", 400));
        }

        // recalculate totals using the extracted function
        const totals = calculateTotals(
            settlement.journeys,
            settlement.rate_per_km,
            settlement.diesel_rate,
            settlement.extra_expense,
            settlement.avg_mileage
        );

        // update the settlement record with new totals
        const beforeSettlement = settlement.toObject ? settlement.toObject() : settlement;
        const updatedSettlement = await Settlement.findByIdAndUpdate(
            id,
            {
                $set: {
                    total_driver_expense: totals.total_driver_expense,
                    total_diesel_expense: totals.total_diesel_expense,
                    total_diesel_quantity: totals.total_diesel_quantity,
                    total_journey_starting_cash: totals.total_journey_starting_cash,
                    total_distance: totals.total_distance,
                    total_rate_per_km: totals.total_rate_per_km,
                    avg_mileage: totals.avg_mileage,
                    total_diesel_used: totals.total_diesel_used,
                    diesel_diff: totals.diesel_diff,
                    diesel_value: totals.diesel_value,
                    driver_total: totals.driver_total,
                    owner_total: totals.owner_total,
                    overall_total: totals.overall_total,
                    payment_status: totals.overall_total === 0 ? "Balanced" : totals.overall_total > 0 ? "Driver needs to pay" : "DRL needs to pay",
                }
            },
            { new: true }
        );
        await logAuditEvent({
            req,
            entityType: "settlement",
            entityId: updatedSettlement._id,
            action: "update",
            before: beforeSettlement,
            after: updatedSettlement.toObject ? updatedSettlement.toObject() : updatedSettlement,
        });

        return successResponse(res, "Settlement recalculated successfully", updatedSettlement);
    } catch (err) {
        console.log("Error in recalculateSettlement: ", err);
        next(err);
    }
};