import { Router } from "express";

import productController from "./product.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createProductValidation,
    updateProductValidation,
    deleteProductValidation,
} from "./product.validation.js";

const router = Router();

// Public Routes
    router.get("/", productController.getAll);
router.get("/:id", productController.getById);

// Admin Routes
    router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createProductValidation,
    validateRequest,
    productController.create
);

router.put(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    updateProductValidation,
    validateRequest,
    productController.update
);

router.delete(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteProductValidation,
    validateRequest,
    productController.delete
);

export default router;