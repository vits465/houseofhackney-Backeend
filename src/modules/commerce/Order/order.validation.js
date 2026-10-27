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
        .custom((val) => {
            if (typeof val === "string" && val.trim().length > 0) {
                return true;
            }
            throw new Error("Invalid order ID");
        })
        .withMessage("Invalid order ID"),

    body("status")
        .custom((val) => {
            const allowed = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "IN PRODUCTION", "DISPATCHED"];
            if (typeof val === "string" && allowed.includes(val.toUpperCase())) {
                return true;
            }
            throw new Error("Invalid order status");
        })
        .withMessage("Invalid order status"),
];

// Param ID validation
export const orderIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid order ID"),
];
