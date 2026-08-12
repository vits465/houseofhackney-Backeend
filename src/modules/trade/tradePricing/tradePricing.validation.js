import { body, param } from "express-validator";

// Validation rules for setting trade pricing
export const setTradePricingValidation = [
    body("productId")
        .notEmpty()
        .withMessage("Product ID is required")
        .isMongoId()
        .withMessage("Invalid product ID"),

    body("tradeTierId")
        .notEmpty()
        .withMessage("Trade tier ID is required")
        .isMongoId()
        .withMessage("Invalid trade tier ID"),

    body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),

    body("minQuantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Minimum quantity must be at least 1"),
];

// Param product ID validation
export const productIdParamValidation = [
    param("productId")
        .isMongoId()
        .withMessage("Invalid product ID"),
];
