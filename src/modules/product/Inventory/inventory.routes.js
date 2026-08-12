import { Router } from "express";

import inventoryController from "./inventory.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createInventoryValidation,
    updateInventoryValidation,
    deleteInventoryValidation,
    getInventoryValidation,
} from "./inventory.validation.js";

const router = Router();

router.get(
    "/:productId",
    getInventoryValidation,
    validateRequest,
    inventoryController.get
);

router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createInventoryValidation,
    validateRequest,
    inventoryController.create
);

router.put(
    "/:productId",
    authMiddleware,
    authorize(["ADMIN"]),
    updateInventoryValidation,
    validateRequest,
    inventoryController.update
);

router.delete(
    "/:productId",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteInventoryValidation,
    validateRequest,
    inventoryController.delete
);

export default router;