import { Router } from "express";

import quotationController from "./quotation.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    requestQuoteValidation,
    negotiateQuoteValidation,
    quoteIdParamValidation,
} from "./quotation.validation.js";

const router = Router();

// All quotation operations require authentication
router.use(authMiddleware);

// Get user quotes list
router.get(
    "/",
    quotationController.getUserQuotes
);

// Get quote details by ID
router.get(
    "/:id",
    quoteIdParamValidation,
    validateRequest,
    quotationController.getQuoteById
);

// Request a new quotation (Trade Customer)
router.post(
    "/request",
    requestQuoteValidation,
    validateRequest,
    quotationController.request
);

// Approve quotation
router.patch(
    "/:id/approve",
    quoteIdParamValidation,
    validateRequest,
    quotationController.approve
);

// Convert quotation to order
router.post(
    "/:id/convert",
    quoteIdParamValidation,
    validateRequest,
    quotationController.convertToOrder
);

// Admin: Negotiate quotation pricing
router.patch(
    "/:id/negotiate",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    negotiateQuoteValidation,
    validateRequest,
    quotationController.negotiate
);

export default router;
