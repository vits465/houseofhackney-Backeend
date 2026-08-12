import { body, param } from "express-validator";

// Validation rules for creating trade tier
export const createTradeTierValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Tier name is required")
        .isIn(["BRONZE", "SILVER", "GOLD", "PLATINUM"])
        .withMessage("Tier name must be BRONZE, SILVER, GOLD, or PLATINUM"),

    body("discountPercentage")
        .isFloat({ min: 0, max: 100 })
        .withMessage("Discount percentage must be between 0 and 100"),

    body("creditLimit")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Credit limit must be a positive number"),

    body("paymentTerm")
        .optional()
        .isIn(["IMMEDIATE", "NET_15", "NET_30", "NET_45", "NET_60"])
        .withMessage("Invalid payment term"),
];

// Param ID validation
export const tierIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid trade tier ID"),
];
