import { body } from "express-validator";
import { validateMongoId } from "../../../shared/validators/isMongoId.js";

export const getSpecificationValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
];

export const createSpecificationValidation = [
    validateMongoId("product", "body", "Invalid product id", { optional: true }),
    validateMongoId("productId", "param", "Invalid product id", { optional: true }),
    body("specifications")
        .isArray({ min: 1 })
        .withMessage("Specifications must be a non-empty array"),
    body("specifications.*.name")
        .optional()
        .trim(),
    body("specifications.*.value")
        .optional()
        .trim(),
];

export const updateSpecificationValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
    body("specifications")
        .optional()
        .isArray()
        .withMessage("Specifications must be an array"),
];

export const deleteSpecificationValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
];
