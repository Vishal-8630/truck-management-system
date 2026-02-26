import Inquiry from '../models/inquiryModel.js';
import { successResponse } from '../utils/response.js';
import sendEmail from '../utils/sendEmail.js';
import AppError from '../utils/appError.js';

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

        // 2. Prepare Email for Admin
        const emailOptions = {
            email: process.env.EMAIL_FROM || 'admin@divyanshiroadlines.com', // For now sending to dummy/configured from email
            subject: `New Inquiry: ${subject}`,
            message: `You have received a new inquiry from your website.\n\nDetails:\nName: ${fullName}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}\n\nPlease check the admin panel for more details.`
        };

        // 3. Send Email (Non-blocking or catch error)
        try {
            await sendEmail(emailOptions);
        } catch (emailErr) {
            console.error('Failed to send inquiry email:', emailErr);
            // We don't fail the request if email fails, as DB entry is created
        }

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

        const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!inquiry) return next(new AppError('Inquiry not found', 404));

        return successResponse(res, 'Status updated successfully', inquiry);
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
};
