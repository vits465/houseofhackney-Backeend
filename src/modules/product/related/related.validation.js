import { body } from "express-validator";
import { validateMongoId } from "../../../shared/validators/isMongoId.js";

export const getRelatedValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
];

export const createRelatedValidation = [
    body("relatedProducts")
        .optional()
        .isArray()
        .withMessage("relatedProducts must be an array"),
    body("relatedProducts.*.product")
        .notEmpty()
        .withMessage("Related product id is required"),
    body("relatedProducts.*.relationType")
        .optional()
        .isIn(["RELATED", "UPSELL", "CROSS_SELL", "SIMILAR"])
        .withMessage("Invalid relationType"),
];

export const updateRelatedValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
    body("relatedProducts")
        .optional()
        .isArray()
        .withMessage("relatedProducts must be an array"),
];

export const addItemValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
    body("relationType")
        .optional()
        .isIn(["RELATED", "UPSELL", "CROSS_SELL", "SIMILAR"])
        .withMessage("Invalid relationType"),
];

export const removeItemValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
    validateMongoId("targetProductId", "param", "Invalid target product id"),
];

export const deleteRelatedValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
];
