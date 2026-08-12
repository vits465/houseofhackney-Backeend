import { Router } from "express";

import tradeTierController from "./tradeTier.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createTradeTierValidation,
    tierIdParamValidation,
} from "./tradeTier.validation.js";

const router = Router();

// All trade tier routes require authentication
router.use(authMiddleware);

// Get active trade tiers
router.get(
    "/",
    tradeTierController.getAll
);

// Get tier details by ID
router.get(
    "/:id",
    tierIdParamValidation,
    validateRequest,
    tradeTierController.getById
);

// Admin: Seed default trade tiers
router.post(
    "/seed",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    tradeTierController.seed
);

// Admin: Create trade tier
router.post(
    "/",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    createTradeTierValidation,
    validateRequest,
    tradeTierController.create
);

// Admin: Update trade tier
router.put(
    "/:id",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    tierIdParamValidation,
    validateRequest,
    tradeTierController.update
);

export default router;
