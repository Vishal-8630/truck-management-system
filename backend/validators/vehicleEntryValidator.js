import { body, validationResult } from 'express-validator';

export const vehicleEntryValidation = [
    body('date')
        .trim().notEmpty().withMessage('Date is required'),
    body('vehicle_no')
        .trim().notEmpty().withMessage("Vehicle Number is required"),
    body('from')
        .trim().notEmpty().withMessage('From is required'),
    body('to')
        .trim().notEmpty().withMessage('To is required'),
    body('freight')
        .trim().notEmpty().withMessage('Freight is required'),
    body('owner')
        .trim().notEmpty().withMessage('Owner is required'),
    body('status')
        .trim().notEmpty().withMessage('Status is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array().reduce((acc, err) => {
                    acc[err.path] = err.msg;
                    return acc;
                }, {})
            })
        }
        next();
    }
]