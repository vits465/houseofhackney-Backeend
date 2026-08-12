import { body, param } from "express-validator";

// Validation rules for creating an order
export const createOrderValidation = [
    body("shippingAddressId")
        .notEmpty()
        .withMessage("Shipping address ID is required")
        .isMongoId()
        .withMessage("Invalid shipping address ID"),

    body("billingAddressId")
        .optional()
        .isMongoId()
        .withMessage("Invalid billing address ID"),

    body("paymentMethod")
        .optional()
        .isIn(["COD", "CARD", "UPI", "NETBANKING", "WALLET"])
        .withMessage("Invalid payment method"),
];

// Validation rules for cancelling an order
export const cancelOrderValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid order ID"),

    body("reason")
        .optional()
        .trim(),
];

// Validation rules for updating order status (Admin)
export const updateStatusValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid order ID"),

    body("status")
        .isIn(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"])
        .withMessage("Invalid order status"),
];

// Param ID validation
export const orderIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid order ID"),
];
