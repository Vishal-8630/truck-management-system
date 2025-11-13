import { body, validationResult } from "express-validator";

/**
 * Ledger Entry Validation Middleware
 * Validates all incoming fields based on your Ledger Schema and category logic.
 */
export const ledgerValidation = [
  // 🗓 Date
  body("date")
    .notEmpty()
    .withMessage("Transaction date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .toDate(),

  // 🧾 Category
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Freight Income",
      "Diesel Expense",
      "Driver Advance",
      "Driver Settlement",
      "In Account",
      "Driver Expense",
      "Toll Expense",
      "Repair Expense",
      "Maintenance Expense",
      "Office Expense",
      "Payment Received",
      "Payment Made",
      "Cash Transfer",
      "Bank Transfer",
      "Other Income",
      "Other Expense",
    ])
    .withMessage("Invalid category type"),

  // ⚙️ Transaction Type
  body("transaction_type")
    .trim()
    .notEmpty()
    .withMessage("Transaction type is required")
    .isIn([
      "Journey",
      "Vehicle Entry",
      "Driver Settlement",
      "Manual Adjustment",
      "Payment Receipt",
      "Expense",
    ])
    .withMessage("Invalid transaction type"),

  // 💰 Debit & Credit
  body("debit")
    .optional()
    .isNumeric()
    .withMessage("Debit must be a number")
    .toFloat(),
  body("credit")
    .optional()
    .isNumeric()
    .withMessage("Credit must be a number")
    .toFloat(),
  body().custom((value, { req }) => {
    const { debit, credit } = req.body;
    if ((!debit || debit <= 0) && (!credit || credit <= 0)) {
      throw new Error("Either debit or credit must be greater than zero");
    }
    return true;
  }),

  // 💳 Payment Mode
  body("payment_mode")
    .trim()
    .notEmpty()
    .withMessage("Payment mode is required")
    .isIn(["Cash", "Bank", "UPI", "Cheque", "Credit"])
    .withMessage("Invalid payment mode"),

  // 🧾 Reference Number
  body("reference_no")
    .optional()
    .trim()
    .isString()
    .withMessage("Reference number must be a string")
    .escape(),

  // 📝 Description
  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Description must be a valid text")
    .escape(),

  // 🧰 Notes
  body("notes")
    .optional()
    .trim()
    .isString()
    .withMessage("Notes must be valid text")
    .escape(),

  // 👤 Created/Updated By
  body("created_by")
    .optional()
    .isString()
    .withMessage("Created By must be a string")
    .trim()
    .escape(),

  body("updated_by")
    .optional()
    .isString()
    .withMessage("Updated By must be a string")
    .trim()
    .escape(),

  // 🔗 IDs (validated as Mongo ObjectIDs)
  body("journey_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Journey ID format"),
  body("truck_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Truck ID format"),
  body("driver_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Driver ID format"),
  body("party_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Party ID format"),
  body("settlement_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Settlement ID format"),
  body("vehicle_entry_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Vehicle Entry ID format"),

  // 🧩 Boolean Flags
  body("is_auto_generated")
    .optional()
    .isBoolean()
    .withMessage("is_auto_generated must be a boolean"),
  body("is_verified")
    .optional()
    .isBoolean()
    .withMessage("is_verified must be a boolean"),
  body("is_locked")
    .optional()
    .isBoolean()
    .withMessage("is_locked must be a boolean"),
  body("is_reversed")
    .optional()
    .isBoolean()
    .withMessage("is_reversed must be a boolean"),

  // 📅 Locked At (if provided)
  body("locked_at")
    .optional()
    .isISO8601()
    .withMessage("locked_at must be a valid date")
    .toDate(),

  // 🧾 GST Details
  body("gst_details")
    .optional()
    .isObject()
    .withMessage("gst_details must be an object"),
  body("gst_details.rate")
    .optional()
    .isNumeric()
    .withMessage("GST rate must be numeric"),
  body("gst_details.amount")
    .optional()
    .isNumeric()
    .withMessage("GST amount must be numeric"),

  // 🧠 Meta Object
  body("meta")
    .optional()
    .isObject()
    .withMessage("Meta must be an object"),

  // ⚙️ Conditional Validations Based on Category
  body("party_id")
    .if(body("category").equals("Freight Income"))
    .notEmpty()
    .withMessage("party_id is required for Freight Income"),

  body("truck_id")
    .if(body("category").equals("Freight Income"))
    .notEmpty()
    .withMessage("truck_id is required for Freight Income"),

  body("journey_id")
    .if(body("category").equals("Freight Income"))
    .notEmpty()
    .withMessage("journey_id is required for Freight Income"),

  // Diesel Expense
  body("truck_id")
    .if(body("category").equals("Diesel Expense"))
    .notEmpty()
    .withMessage("truck_id is required for Diesel Expense"),

  // Driver Advance
  body("driver_id")
    .if(body("category").equals("Driver Advance"))
    .notEmpty()
    .withMessage("driver_id is required for Driver Advance"),

  // Driver Settlement
  body("driver_id")
    .if(body("category").equals("Driver Settlement"))
    .notEmpty()
    .withMessage("driver_id is required for Driver Settlement"),

  body("settlement_id")
    .if(body("category").equals("Driver Settlement"))
    .notEmpty()
    .withMessage("settlement_id is required for Driver Settlement"),

  // Payment Received
  body("party_id")
    .if(body("category").equals("Payment Received"))
    .notEmpty()
    .withMessage("party_id is required for Payment Received"),
  body("reference_no")
    .if(body("category").equals("Payment Received"))
    .notEmpty()
    .withMessage("reference_no is required for Payment Received"),

  // Payment Made
  body("reference_no")
    .if(body("category").equals("Payment Made"))
    .notEmpty()
    .withMessage("reference_no is required for Payment Made"),

  // 📜 Final Error Handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().reduce((acc, err) => {
          acc[err.path] = err.msg;
          return acc;
        }, {}),
      });
    }
    next();
  },
];