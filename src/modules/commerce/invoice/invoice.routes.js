import { Router } from "express";

import invoiceController from "./invoice.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    generateInvoiceValidation,
    updateStatusValidation,
    invoiceIdParamValidation,
    orderIdParamValidation,
} from "./invoice.validation.js";

const router = Router();

// All invoice operations require authentication
router.use(authMiddleware);

// Get user invoices list
router.get(
    "/",
    invoiceController.getAll
);

// Get invoice by order ID
router.get(
    "/order/:orderId",
    orderIdParamValidation,
    validateRequest,
    invoiceController.getByOrder
);

// Get invoice details by ID
router.get(
    "/:id",
    invoiceIdParamValidation,
    validateRequest,
    invoiceController.getById
);

// Generate invoice for order
router.post(
    "/generate",
    generateInvoiceValidation,
    validateRequest,
    invoiceController.generate
);

// Admin: Update invoice status
router.patch(
    "/:id/status",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    updateStatusValidation,
    validateRequest,
    invoiceController.updateStatus
);

export default router;
