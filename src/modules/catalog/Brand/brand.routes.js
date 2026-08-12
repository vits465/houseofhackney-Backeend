import { Router } from "express";

import brandController from "./brand.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createBrandValidation,
    updateBrandValidation,
    deleteBrandValidation,
} from "./brand.validation.js";

const router = Router();

// Public
    router.get(
    "/",
    brandController.getAll
);

router.get(
    "/:id",
    brandController.getById
);

// Admin
    router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createBrandValidation,
    validateRequest,
    brandController.create
);

router.put(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    updateBrandValidation,
    validateRequest,
    brandController.update
);

router.delete(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteBrandValidation,
    validateRequest,
    brandController.delete
);

export default router;