import { Router } from "express";

import orderController from "./order.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createOrderValidation,
    cancelOrderValidation,
    updateStatusValidation,
    orderIdParamValidation,
} from "./order.validation.js";

const router = Router();

// All order operations require authentication
router.use(authMiddleware);

// Get user orders list
router.get(
    "/",
    orderController.getUserOrders
);

// Get single order details
router.get(
    "/:id",
    orderIdParamValidation,
    validateRequest,
    orderController.getOrderDetails
);

// Place a new order from cart
router.post(
    "/",
    createOrderValidation,
    validateRequest,
    orderController.create
);

// Cancel order
router.patch(
    "/:id/cancel",
    cancelOrderValidation,
    validateRequest,
    orderController.cancelOrder
);

// Admin: Update order status
router.patch(
    "/:id/status",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    updateStatusValidation,
    validateRequest,
    orderController.updateStatus
);

export default router;
