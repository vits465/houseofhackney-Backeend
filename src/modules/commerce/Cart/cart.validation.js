import { body, param } from "express-validator";

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

    body("quantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Quantity must be an integer of at least 1"),
];

export const updateQuantityValidation = [
    param("itemId")
        .notEmpty()
        .withMessage("Cart item id is required")
        .isMongoId()
        .withMessage("Invalid cart item id"),

    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be an integer of at least 1"),
];

export const removeItemValidation = [
    param("itemId")
        .notEmpty()
        .withMessage("Cart item id is required")
        .isMongoId()
        .withMessage("Invalid cart item id"),
];

export const applyCouponValidation = [
    body("couponCode")
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required"),
];
