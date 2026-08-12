import { body, param } from "express-validator";

// Validation rules for creating a coupon
export const createCouponValidation = [
    body("code")
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required"),

    body("discountType")
        .isIn(["PERCENTAGE", "FLAT"])
        .withMessage("Discount type must be PERCENTAGE or FLAT"),

    body("discountValue")
        .isFloat({ min: 0 })
        .withMessage("Discount value must be a positive number"),

    body("expiryDate")
        .isISO8601()
        .withMessage("Valid ISO expiry date is required"),

    body("minOrderAmount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("minOrderAmount must be a non-negative number"),

    body("maxDiscountAmount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("maxDiscountAmount must be a non-negative number"),

    body("usageLimit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("usageLimit must be an integer of at least 1"),

    body("perUserLimit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("perUserLimit must be an integer of at least 1"),
];

// Validation rules for validating a coupon code
export const validateCouponValidation = [
    body("code")
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required"),

    body("subtotal")
        .isFloat({ min: 0 })
        .withMessage("Subtotal must be a non-negative number"),
];

// Param ID validation
export const couponIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid coupon ID"),
];
