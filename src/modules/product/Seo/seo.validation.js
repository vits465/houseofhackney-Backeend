import { body } from "express-validator";

import { validateMongoId } from "../../../shared/validators/isMongoId.js";

export const createSEOValidation = [

    validateMongoId(
        "product",
        "body",
        "Invalid product id",
        { optional: true }
    ),

    validateMongoId(
        "productId",
        "param",
        "Invalid product id",
        { optional: true }
    ),

    validateMongoId(
        "ogImage",
        "body",
        "Invalid OG image",
        { optional: true }
    ),

    body("metaTitle")
        .optional()
        .isLength({ max: 70 })
        .withMessage("Meta title cannot exceed 70 characters"),

    body("metaDescription")
        .optional()
        .isLength({ max: 160 })
        .withMessage("Meta description cannot exceed 160 characters"),

];

export const updateSEOValidation = [
    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),
];

export const deleteSEOValidation = [
    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),
];

export const getSEOValidation = [
    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),
];