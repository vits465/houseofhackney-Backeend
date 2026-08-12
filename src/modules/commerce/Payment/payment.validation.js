import { body, param } from "express-validator";

// Validation rules for initiating payment
export const initiatePaymentValidation = [
    body("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .isMongoId()
        .withMessage("Invalid order ID"),

    body("provider")
        .optional()
        .isIn(["STRIPE", "RAZORPAY", "PAYPAL", "COD"])
        .withMessage("Invalid payment provider"),

    body("paymentMethod")
        .optional()
        .isIn(["CARD", "UPI", "NETBANKING", "WALLET", "COD"])
        .withMessage("Invalid payment method"),
];

// Validation rules for verifying payment
export const verifyPaymentValidation = [
    body("paymentId")
        .notEmpty()
        .withMessage("Payment ID is required")
        .isMongoId()
        .withMessage("Invalid payment ID"),

    body("gatewayTransactionId")
        .optional()
        .trim(),

    body("status")
        .optional()
        .isIn(["COMPLETED", "FAILED"])
        .withMessage("Status must be COMPLETED or FAILED"),
];

// Validation rules for refund (Admin)
export const refundValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid payment ID"),

    body("refundAmount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Refund amount must be a positive number"),

    body("reason")
        .optional()
        .trim(),
];

// Param ID validation
export const paymentIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid payment ID"),
];
