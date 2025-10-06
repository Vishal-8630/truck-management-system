import { body, validationResult } from 'express-validator';

export const billingEntryValidations = [
    body('bill_no')
        .trim().notEmpty().withMessage('Bill Number is required'),
    body('bill_date')
        .trim().notEmpty().withMessage("Bill Date is required"),
    body('lr_no')
        .trim().notEmpty().withMessage('LR Number is required'),
    body('lr_date')
        .trim().notEmpty().withMessage('LR Date is required'),
    body('consignor_name')
        .trim().notEmpty().withMessage('Consignor Name is required'),
    body('consignor_from_address')
        .trim().notEmpty().withMessage('Consignor From Address is required'),
    body('consignor_gst_no')
        .trim().notEmpty().withMessage('Consignor GST Number is required'),
    body('consignee')
        .trim().notEmpty().withMessage('Consignee is required'),
    body('consignor_to_address')
        .trim().notEmpty().withMessage('Consignor To Address is required'),
    body('vehicle_no')
        .trim().notEmpty().withMessage('Vehicle Number is required'),
    body('from')
        .trim().notEmpty().withMessage('From is required'),
    body('to')
        .trim().notEmpty().withMessage('To is required'),
    body('weight')
        .trim().notEmpty().withMessage('Weight is required'),
    body('fixed')
        .trim().notEmpty().withMessage('Fixed is required'),
    body('mode_of_packing')
        .trim().notEmpty().withMessage('Mode Of Packing is required'),
    body('invoice_no')
        .trim().notEmpty().withMessage('Invoice Number is required'),
    body('description_of_goods')
        .trim().notEmpty().withMessage('Description Of Goods is required'),
    body('value')
        .trim().notEmpty().withMessage('Value is required'),
    body('name_of_clerk')
        .trim().notEmpty().withMessage('Name Of Clerk is required'),
    body('to_be_billed_at')
        .trim().notEmpty().withMessage('To Be Billed At is required'),
    body('risk')
        .trim().notEmpty().withMessage('Risk is required'),
    body('address_of_billing_office')
        .trim().notEmpty().withMessage('Address Of Billing Office is required'),
    body('rate')
        .trim().notEmpty().withMessage('Rate is required'),

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