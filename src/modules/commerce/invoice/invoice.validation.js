import { body, param } from "express-validator";

// Validation rules for generating an invoice
export const generateInvoiceValidation = [
    body("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .isMongoId()
        .withMessage("Invalid order ID"),
];

// Validation rules for updating invoice status (Admin)
export const updateStatusValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid invoice ID"),

    body("status")
        .isIn(["DRAFT", "ISSUED", "PAID", "CANCELLED"])
        .withMessage("Invalid invoice status"),
];

// Param ID validation
export const invoiceIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid invoice ID"),
];

// Param order ID validation
export const orderIdParamValidation = [
    param("orderId")
        .isMongoId()
        .withMessage("Invalid order ID"),
];
