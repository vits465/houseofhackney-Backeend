import { body, param, query } from "express-validator";

export const addItemValidation = [
    body("product")
        .notEmpty()
        .withMessage("Product id is required")
        .isMongoId()
        .withMessage("Invalid product id"),

    body("variant")
        .optional()
        .isMongoId()
        .withMessage("Invalid variant id"),
];

export const removeItemValidation = [
    param("productId")
        .notEmpty()
        .withMessage("Product id is required")
        .isMongoId()
        .withMessage("Invalid product id"),

    query("variantId")
        .optional()
        .isMongoId()
        .withMessage("Invalid variant id"),
];
