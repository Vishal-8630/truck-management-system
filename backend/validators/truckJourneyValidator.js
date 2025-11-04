import { body, validationResult } from 'express-validator';

export const truckJourneyValidation = [
    body('truck')
        .custom(value => {
            if (!value || !value._id) throw new Error('Truck is required');
            return true;
        }),

    body('driver')
        .custom(value => {
            if (!value || !value._id) throw new Error('Driver is required');
            return true;
        }),

    body('from')
        .notEmpty().withMessage('From is required'),

    body('to')
        .notEmpty().withMessage('To is required'),

    body('starting_kms')
        .notEmpty().withMessage('Starting Kilometers are required'),

    body('journey_starting_cash')
        .notEmpty().withMessage('Journey Starting Cash is required'),

    body('average_mileage')
        .notEmpty().withMessage('Truck Mileage is required'),

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