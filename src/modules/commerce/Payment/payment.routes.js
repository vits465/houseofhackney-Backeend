import { Router } from "express";

import paymentController from "./payment.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    initiatePaymentValidation,
    verifyPaymentValidation,
    refundValidation,
    paymentIdParamValidation,
} from "./payment.validation.js";

const router = Router();

// All payment operations require authentication
router.use(authMiddleware);

// Initiate payment session
router.post(
    "/initiate",
    initiatePaymentValidation,
    validateRequest,
    paymentController.initiate
);

// Verify payment callback/webhook
router.post(
    "/verify",
    verifyPaymentValidation,
    validateRequest,
    paymentController.verify
);

// Get user payment history
router.get(
    "/",
    paymentController.getUserPayments
);

// Get payment details
router.get(
    "/:id",
    paymentIdParamValidation,
    validateRequest,
    paymentController.getPaymentDetails
);

// Admin: Process payment refund
router.post(
    "/:id/refund",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    refundValidation,
    validateRequest,
    paymentController.refund
);

export default router;
