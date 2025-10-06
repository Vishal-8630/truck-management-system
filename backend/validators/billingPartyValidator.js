import { body, validationResult } from 'express-validator';

export const billingPartyValidations = [
    body("name")
        .trim().notEmpty().withMessage("Billing Party Name is required"),
    body("address")
        .trim().notEmpty().withMessage("Billing Party Address is required"),
    body("gst_no")
        .trim().notEmpty().withMessage("Billing Party GST Number is required"),

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