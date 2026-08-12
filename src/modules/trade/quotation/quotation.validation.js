import { body, param } from "express-validator";

// Validation rules for requesting a quote
export const requestQuoteValidation = [
    body("items")
        .isArray({ min: 1 })
        .withMessage("Items array is required and must contain at least 1 item"),

    body("items.*.product")
        .isMongoId()
        .withMessage("Invalid product ID in items"),

    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be an integer of at least 1"),
];

// Validation rules for admin negotiation
export const negotiateQuoteValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid quote ID"),

    body("discount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Discount must be a positive number"),
];

// Param ID validation
export const quoteIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid quote ID"),
];
