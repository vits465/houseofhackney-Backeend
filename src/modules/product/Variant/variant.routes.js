import { Router } from "express";

import variantController from "./variant.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createVariantValidation,
    updateVariantValidation,
    deleteVariantValidation,
    getVariantValidation,
} from "./variant.validation.js";

const router = Router();

router.get(
    "/product/:productId",
    getVariantValidation,
    validateRequest,
    variantController.getAll
);

router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createVariantValidation,
    validateRequest,
    variantController.create
);

router.put(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    updateVariantValidation,
    validateRequest,
    variantController.update
);

router.delete(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteVariantValidation,
    validateRequest,
    variantController.delete
);

export default router;