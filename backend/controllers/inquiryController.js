import Inquiry from '../models/inquiryModel.js';
import { successResponse } from '../utils/response.js';

import AppError from '../utils/appError.js';
import logAuditEvent from "../utils/audit/logAuditEvent.js";

export const createInquiry = async (req, res, next) => {
    try {
        const { fullName, email, subject, message } = req.body;

        // 1. Create Inquiry in DB
        const inquiry = await Inquiry.create({
            fullName,
            email,
            subject,
            message
        });
        await logAuditEvent({
            req,
            entityType: "inquiry",
            entityId: inquiry._id,
            action: "create",
            before: {},
            after: inquiry.toObject(),
        });



        return successResponse(res, 'Inquiry sent successfully. We will get back to you soon!', inquiry);
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
};

export const getAllInquiries = async (req, res, next) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        return successResponse(res, 'Inquiries fetched successfully', inquiries);
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
};

export const updateInquiryStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const beforeInquiry = await Inquiry.findById(id).lean();
        const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!inquiry) return next(new AppError('Inquiry not found', 404));
        await logAuditEvent({
            req,
            entityType: "inquiry",
            entityId: inquiry._id,
            action: "status_change",
            before: beforeInquiry || {},
            after: inquiry.toObject ? inquiry.toObject() : inquiry,
        });

        return successResponse(res, 'Status updated successfully', inquiry);
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
};
