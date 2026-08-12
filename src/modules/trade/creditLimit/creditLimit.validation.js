import { body } from "express-validator";

// Validation rules for configuring credit limit (Admin)
export const setCreditLimitValidation = [
    body("companyId")
        .notEmpty()
        .withMessage("Company ID is required")
        .isMongoId()
        .withMessage("Invalid company ID"),

    body("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isMongoId()
        .withMessage("Invalid user ID"),

    body("totalCredit")
        .isFloat({ min: 0 })
        .withMessage("Total credit must be a positive number"),

    body("paymentTerm")
        .optional()
        .isIn(["IMMEDIATE", "NET_15", "NET_30", "NET_45", "NET_60"])
        .withMessage("Invalid payment term"),
];
