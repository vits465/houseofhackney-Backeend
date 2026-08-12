import { Router } from "express";

import tradePricingController from "./tradePricing.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    setTradePricingValidation,
    productIdParamValidation,
} from "./tradePricing.validation.js";

const router = Router();

// All trade pricing routes require authentication
router.use(authMiddleware);

// Get trade pricings by product ID
router.get(
    "/product/:productId",
    productIdParamValidation,
    validateRequest,
    tradePricingController.getByProduct
);

// Admin: Set trade pricing for product tier
router.post(
    "/",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    setTradePricingValidation,
    validateRequest,
    tradePricingController.setPricing
);

export default router;
