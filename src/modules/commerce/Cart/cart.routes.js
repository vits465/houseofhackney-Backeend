import { Router } from "express";

import cartController from "./cart.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    addItemValidation,
    updateQuantityValidation,
    removeItemValidation,
    applyCouponValidation,
} from "./cart.validation.js";

const router = Router();

// All cart operations require authentication
    router.use(authMiddleware);

router.get(
    "/",
    cartController.getCart
);

router.post(
    "/",
    addItemValidation,
    validateRequest,
    cartController.add
);

router.patch(
    "/item/:itemId",
    updateQuantityValidation,
    validateRequest,
    cartController.updateQuantity
);

router.delete(
    "/item/:itemId",
    removeItemValidation,
    validateRequest,
    cartController.remove
);

router.delete(
    "/",
    cartController.clear
);

router.post(
    "/coupon",
    applyCouponValidation,
    validateRequest,
    cartController.applyCoupon
);

router.delete(
    "/coupon",
    cartController.removeCoupon
);

export default router;
