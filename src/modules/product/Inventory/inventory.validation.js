import { body } from "express-validator";
import { validateMongoId } from "../../../shared/validators/isMongoId.js";

export const createInventoryValidation = [

    validateMongoId(
        "product",
        "body",
        "Invalid product id"
    ),

    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Stock must be 0 or greater"),

    body("reservedStock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Reserved stock must be 0 or greater"),

    body("minimumStock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Minimum stock must be 0 or greater"),

    body("maximumStock")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Maximum stock must be greater than 0"),

    body("trackInventory")
        .optional()
        .isBoolean(),

    body("allowBackorder")
        .optional()
        .isBoolean(),
];

export const updateInventoryValidation = [
    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),
];

export const deleteInventoryValidation = [
    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),
];

export const getInventoryValidation = [
    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),
];