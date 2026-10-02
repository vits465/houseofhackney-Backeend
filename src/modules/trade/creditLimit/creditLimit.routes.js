import { Router } from "express";

import creditLimitController from "./creditLimit.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import { setCreditLimitValidation } from "./creditLimit.validation.js";

const router = Router();

// All credit limit operations require authentication
router.use(authMiddleware);

// Admin: Get all company credit limits
router.get(
    "/",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    creditLimitController.getAllCredits
);

// Get current user credit details
router.get(
    "/me",
    creditLimitController.getMyCredit
);

// Admin: Set company credit limit
router.post(
    "/",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    setCreditLimitValidation,
    validateRequest,
    creditLimitController.setLimit
);

export default router;
