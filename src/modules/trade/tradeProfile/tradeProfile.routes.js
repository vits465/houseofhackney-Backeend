import { Router } from "express";

import tradeProfileController from "./tradeProfile.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    applyTradeValidation,
    reviewTradeValidation,
} from "./tradeProfile.validation.js";

const router = Router();

// All trade profile operations require authentication
router.use(authMiddleware);

// Get all trade profiles (Admin)
router.get(
    "/",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    tradeProfileController.getAllProfiles
);

// Get current user trade profile
router.get(
    "/me",
    tradeProfileController.getMyProfile
);

// Apply for trade account
router.post(
    "/apply",
    applyTradeValidation,
    validateRequest,
    tradeProfileController.apply
);

// Admin: Get pending trade applications
router.get(
    "/pending",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    tradeProfileController.getPendingApplications
);

// Admin: Review (Approve/Reject) application
router.patch(
    "/:id/review",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    reviewTradeValidation,
    validateRequest,
    tradeProfileController.review
);

export default router;
