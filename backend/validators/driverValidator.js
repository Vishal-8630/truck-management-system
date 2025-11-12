import { body, validationResult } from 'express-validator';

export const driverValidation = [
    body('name')
        .notEmpty().withMessage('Driver name is required'),

    body('address')
        .notEmpty().withMessage('Driver address is required'),

    body('phone')
        .notEmpty().withMessage('Phone number is required'),

    body('adhaar_no')
        .notEmpty().withMessage('Adhaar is required'),

    body('dl')
        .notEmpty().withMessage('Driving Licence is required'),

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