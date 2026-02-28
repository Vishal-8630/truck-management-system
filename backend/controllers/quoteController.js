import Quote from '../models/quoteModel.js';
import { successResponse } from '../utils/response.js';

import AppError from '../utils/appError.js';
// Removed invalid formatDate import


export const createQuote = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, pickupLocation, dropLocation, cargoType, weight, truckType, pickupDate, message } = req.body;

        // 1. Create Quote in DB
        const quote = await Quote.create({
            fullName, email, phoneNumber, pickupLocation, dropLocation, cargoType, weight, truckType, pickupDate, message
        });



        return successResponse(res, 'Quote request sent successfully! Our team will call you within 24 hours.', quote);
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
};

export const getAllQuotes = async (req, res, next) => {
    try {
        const quotes = await Quote.find().sort({ createdAt: -1 });
        return successResponse(res, 'Quotes fetched successfully', quotes);
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
};

export const updateQuoteStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const quote = await Quote.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!quote) return next(new AppError('Quote not found', 404));

        return successResponse(res, 'Status updated successfully', quote);
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
};
