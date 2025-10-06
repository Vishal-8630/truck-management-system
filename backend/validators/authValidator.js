import { body, validationResult } from 'express-validator';

export const registerValidation = [
    body('fullname')
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters long'),
        
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

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

export const loginValidation = [
    body("username")
        .notEmpty().withMessage("Username is required"),

    body("password")
        .notEmpty().withMessage("Password is required"),

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
            });
        }
        next();
    }
]