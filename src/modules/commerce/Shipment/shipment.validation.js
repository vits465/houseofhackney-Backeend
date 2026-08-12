import { body, param } from "express-validator";

// Validation rules for creating a shipment (Admin)
export const createShipmentValidation = [
    body("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .isMongoId()
        .withMessage("Invalid order ID"),

    body("courierName")
        .trim()
        .notEmpty()
        .withMessage("Courier name is required"),

    body("trackingNumber")
        .trim()
        .notEmpty()
        .withMessage("Tracking number (AWB) is required"),

    body("trackingUrl")
        .optional()
        .trim(),

    body("estimatedDelivery")
        .optional()
        .isISO8601()
        .withMessage("Valid ISO estimated delivery date is required"),
];

// Validation rules for updating shipment tracking status (Admin)
export const updateStatusValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid shipment ID"),

    body("status")
        .isIn([
            "PENDING",
            "DISPATCHED",
            "IN_TRANSIT",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "FAILED_ATTEMPT",
            "RETURNED",
        ])
        .withMessage("Invalid shipment status"),

    body("location")
        .optional()
        .trim(),

    body("comment")
        .optional()
        .trim(),
];

// Param order ID validation
export const orderIdParamValidation = [
    param("orderId")
        .isMongoId()
        .withMessage("Invalid order ID"),
];

// Param tracking number validation
export const trackingNumberParamValidation = [
    param("trackingNumber")
        .trim()
        .notEmpty()
        .withMessage("Tracking number is required"),
];
