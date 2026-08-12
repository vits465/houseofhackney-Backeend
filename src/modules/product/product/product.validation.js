import { body } from "express-validator";
import { validateMongoId } from "../../../shared/validators/isMongoId.js";
import {
    PRODUCT_STATUS,
    PRODUCT_VISIBILITY,
    PRODUCT_TYPES,
} from "../../../shared/constants/product.constants.js";

export const createProductValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required.")
        .isLength({ min: 2, max: 250 }),

    body("productType")
        .notEmpty()
        .isIn(Object.values(PRODUCT_TYPES)),

    validateMongoId("category", "body", "Invalid category id"),

    validateMongoId("brand", "body", "Invalid brand id", { optional: true }),

    validateMongoId("collection", "body", "Invalid collection id", { optional: true }),

    validateMongoId("designer", "body", "Invalid designer id", { optional: true }),

    validateMongoId("material", "body", "Invalid material id", { optional: true }),

    body("status")
        .optional()
        .isIn(Object.values(PRODUCT_STATUS)),

    body("visibility")
        .optional()
        .isIn(Object.values(PRODUCT_VISIBILITY)),

];

export const updateProductValidation = [
    validateMongoId("id", "param", "Invalid product id"),
];

export const deleteProductValidation = [
    validateMongoId("id", "param", "Invalid product id"),
];

export const getProductValidation = [
    validateMongoId("id", "param", "Invalid product id"),
];