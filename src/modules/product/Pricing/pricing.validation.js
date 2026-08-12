import { body } from "express-validator";

import { validateMongoId } from "../../../shared/validators/isMongoId.js";

import { CURRENCIES } from "../../../shared/constants/currency.constants.js";
import { TAX_CLASSES } from "../../../shared/constants/tax.constant.js";

export const createPricingValidation = [

    validateMongoId("product", "body", "Invalid product id"),

    body("sellingPrice")
        .isFloat({ min: 0 })
        .withMessage("Selling price must be greater than or equal to 0"),

    body("costPrice")
        .optional()
        .isFloat({ min: 0 }),

    body("compareAtPrice")
        .optional()
        .isFloat({ min: 0 }),

    body("tradePrice")
        .optional()
        .isFloat({ min: 0 }),

    body("currency")
        .optional()
        .isIn(Object.values(CURRENCIES)),

    body("taxClass")
        .optional()
        .isIn(Object.values(TAX_CLASSES))

];

export const updatePricingValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
];

export const deletePricingValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
];