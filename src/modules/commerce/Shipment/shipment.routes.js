import { Router } from "express";

import shipmentController from "./shipment.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createShipmentValidation,
    updateStatusValidation,
    orderIdParamValidation,
    trackingNumberParamValidation,
} from "./shipment.validation.js";

const router = Router();

// Public: Track shipment by AWB number
router.get(
    "/track/:trackingNumber",
    trackingNumberParamValidation,
    validateRequest,
    shipmentController.track
);

// Protected routes below require authentication
router.use(authMiddleware);

// Get user shipments list
router.get(
    "/",
    shipmentController.getUserShipments
);

// Get shipment details for order
router.get(
    "/order/:orderId",
    orderIdParamValidation,
    validateRequest,
    shipmentController.getByOrder
);

// Admin: Create shipment for an order
router.post(
    "/",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    createShipmentValidation,
    validateRequest,
    shipmentController.create
);

// Admin: Update tracking status
router.patch(
    "/:id/status",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    updateStatusValidation,
    validateRequest,
    shipmentController.updateStatus
);

export default router;
