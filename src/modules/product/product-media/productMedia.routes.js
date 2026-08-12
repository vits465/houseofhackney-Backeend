import { Router } from "express";

import productMediaController from "./productMedia.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createProductMediaValidation,
    updateProductMediaValidation,
    deleteProductMediaValidation,
    getProductMediaValidation,
} from "./productMedia.validation.js";

const router = Router({ mergeParams: true });

router.get(
    "/",
    getProductMediaValidation,
    validateRequest,
    productMediaController.get
);

router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createProductMediaValidation,
    validateRequest,
    productMediaController.create
);

router.put(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    updateProductMediaValidation,
    validateRequest,
    productMediaController.update
);

router.delete(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteProductMediaValidation,
    validateRequest,
    productMediaController.delete
);

export default router;