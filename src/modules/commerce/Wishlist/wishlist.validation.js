import { body, param, query } from "express-validator";

export const addItemValidation = [
    (req, res, next) => {
        if (!req.body.product && req.body.productId) {
            req.body.product = req.body.productId;
        }
        if (!req.body.variant && req.body.variantId) {
            req.body.variant = req.body.variantId;
        }
        next();
    },
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
