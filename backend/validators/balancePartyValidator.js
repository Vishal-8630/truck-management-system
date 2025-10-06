import { body, validationResult } from 'express-validator';

export const balancePartyValidations = [
    body('party_name')
        .trim().notEmpty().withMessage('Party Name is required'),

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