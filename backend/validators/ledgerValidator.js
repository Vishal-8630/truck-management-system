import { body, validationResult } from "express-validator";

const CATEGORY_RULES = {
  "Freight Income": ["party", "truck", "journey"],
  "Diesel Expense": ["truck"],
  "Driver Advance": ["driver"],
  "Driver Settlement": ["driver", "settlement"],
  "In Account": ["party"],
  "Driver Expense": ["driver"],
  "Toll Expense": ["truck"],
  "Repair Expense": ["truck"],
  "Maintenance Expense": ["truck"],
  "Office Expense": [],
  "Payment Received": ["party", "reference_no"],
  "Payment Made": ["reference_no"],
  "Cash Transfer": ["party"],
  "Bank Transfer": ["party"],
  "Other Income": [],
  "Other Expense": [],
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const ledgerValidation = [
  // 📅 DATE
  body("date")
    .notEmpty().withMessage("Transaction date is required")
    .isISO8601().withMessage("Invalid date format")
    .toDate(),

  // CATEGORY
  body("category")
    .trim().notEmpty().withMessage("Category is required")
    .isIn(Object.keys(CATEGORY_RULES))
    .withMessage("Invalid category type"),

  // TRANSACTION TYPE
  body("transaction_type")
    .trim().notEmpty().withMessage("Transaction type is required")
    .isIn([
      "Journey",
      "Vehicle Entry",
      "Driver Settlement",
      "Manual Adjustment",
      "Payment Receipt",
      "Expense",
    ])
    .withMessage("Invalid transaction type"),

  // DEBIT / CREDIT
  body("debit").custom((value, { req }) => {
    const { debit, credit } = req.body;
    if ((!debit || debit <= 0) && (!credit || credit <= 0)) {
      throw new Error("Either debit or credit must be greater than zero");
    }
    return true;
  }),

  body("credit").custom((value, { req }) => {
    const { debit, credit } = req.body;
    if ((!debit || debit <= 0) && (!credit || credit <= 0)) {
      throw new Error("Either debit or credit must be greater than zero");
    }
    return true;
  }),

  // PAYMENT MODE
  body("payment_mode")
    .trim().notEmpty().withMessage("Payment mode is required")
    .isIn(["Cash", "Bank", "UPI", "Cheque", "Credit"])
    .withMessage("Invalid payment mode"),

  // REFERENCE NO
  body("reference_no")
    .optional().isString().withMessage("Reference no must be string"),

  // CATEGORY REQUIRED FIELDS
  body().custom((_, { req }) => {
    const category = req.body.category;
    const required = CATEGORY_RULES[category] || [];

    const missing = {};

    // 1. Check Category Specific Rules
    required.forEach((field) => {
      const val = req.body[field];
      const label = capitalize(field.replace(/_/g, " "));

      if (val && typeof val === "object") {
        if (!val._id) {
          missing[field] = `${label} is required for ${category}`;
        }
      } else if (!val || val === "") {
        missing[field] = `${label} is required for ${category}`;
      }
    });

    // 2. Ensure AT LEAST ONE LOOKUP IS PROVIDED (Overall check)
    const lookupFields = ["journey", "truck", "driver", "party", "settlement", "vehicle_entry"];
    const hasLookup = lookupFields.some(field => {
      const val = req.body[field];
      return val && (typeof val === "object" ? val._id : val !== "");
    });

    if (!hasLookup) {
      missing.general = "At least one lookup (Party, Truck, Journey, etc.) must be selected";
    }

    if (Object.keys(missing).length > 0) {
      return Promise.reject({ msg: "CATEGORY_FIELD_ERRORS", missing });
    }

    return true;
  }),

  // FINAL HANDLER
  (req, res, next) => {
    const result = validationResult(req);
    let formatted = {};

    result.array().forEach(err => {
      // Debit/credit
      if (err.msg === "Either debit or credit must be greater than zero") {
        formatted.debit = err.msg;
        formatted.credit = err.msg;
      }

      // CATEGORY ERRORS
      else if (err.msg?.msg === "CATEGORY_FIELD_ERRORS") {
        formatted = { ...formatted, ...err.msg.missing };
      }

      // Normal errors
      else if (typeof err.msg === "string") {
        formatted[err.path] = err.msg;
      }
    });

    if (Object.keys(formatted).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatted,
      });
    }

    next();
  },
];