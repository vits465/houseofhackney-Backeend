import { body, param } from "express-validator";

import { validateMongoId } from "../../../shared/validators/isMongoId.js";

export const createBrandValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Brand name is required.")
        .isLength({ min: 2, max: 100 })
        .withMessage("Brand name must be between 2 and 100 characters."),

    body("description")
        .optional()
        .isLength({ max: 2000 })
        .withMessage("Description cannot exceed 2000 characters."),

    body("shortDescription")
        .optional()
        .isLength({ max: 300 })
        .withMessage("Short description cannot exceed 300 characters."),

    body("website")
        .optional()
        .isURL()
        .withMessage("Invalid website URL."),

    body("country")
        .optional()
        .isLength({ max: 100 }),

    body("establishedYear")
        .optional()
        .isInt({ min: 1800 }),

    body("sortOrder")
        .optional()
        .isInt({ min: 0 }),

    body("isFeatured")
        .optional()
        .isBoolean(),

    body("status")
        .optional()
        .isIn(["ACTIVE", "INACTIVE"])

];

export const updateBrandValidation = [
    validateMongoId("id", "param", "Invalid brand id."),
];

export const deleteBrandValidation = [
    validateMongoId("id", "param", "Invalid brand id."),
];

export const getBrandValidation = [
    validateMongoId("id", "param", "Invalid brand id."),
];