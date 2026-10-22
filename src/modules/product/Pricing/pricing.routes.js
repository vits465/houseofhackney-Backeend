import { Router } from "express";

import pricingController from "./pricing.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import optionalAuthMiddleware from "../../../middlewares/optionalAuth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createPricingValidation,
    updatePricingValidation,
    deletePricingValidation,
} from "./pricing.validation.js";

const router = Router({ mergeParams: true });

// Public (with optional auth to securely disclose trade pricing only to verified trade accounts)
router.get("/", optionalAuthMiddleware, pricingController.get);

// Admin
router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createPricingValidation,
    validateRequest,
    pricingController.create
);

router.put(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    updatePricingValidation,
    validateRequest,
    pricingController.update
);

router.delete(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    deletePricingValidation,
    validateRequest,
    pricingController.delete
);

export default router;