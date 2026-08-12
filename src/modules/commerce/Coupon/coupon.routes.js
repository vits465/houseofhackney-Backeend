import { Router } from "express";

import couponController from "./coupon.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createCouponValidation,
    validateCouponValidation,
    couponIdParamValidation,
} from "./coupon.validation.js";

const router = Router();

// All coupon operations require authentication
router.use(authMiddleware);

// Validate coupon code against user cart subtotal
router.post(
    "/validate",
    validateCouponValidation,
    validateRequest,
    couponController.validate
);

// Get all coupons
router.get(
    "/",
    couponController.getAll
);

// Get single coupon details
router.get(
    "/:id",
    couponIdParamValidation,
    validateRequest,
    couponController.getById
);

// Admin: Create a new coupon
router.post(
    "/",
    authorize("ADMIN"),
    createCouponValidation,
    validateRequest,
    couponController.create
);

// Admin: Update coupon details
router.put(
    "/:id",
    authorize("ADMIN"),
    couponIdParamValidation,
    validateRequest,
    couponController.update
);

// Admin: Delete coupon
router.delete(
    "/:id",
    authorize("ADMIN"),
    couponIdParamValidation,
    validateRequest,
    couponController.delete
);

export default router;
