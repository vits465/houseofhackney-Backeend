import { Router } from "express";

import seoController from "./seo.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createSEOValidation,
    updateSEOValidation,
    deleteSEOValidation,
    getSEOValidation,
} from "./seo.validation.js";

const router = Router({ mergeParams: true });

router.get(
    "/",
    getSEOValidation,
    validateRequest,
    seoController.get
);

router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createSEOValidation,
    validateRequest,
    seoController.create
);

router.put(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    updateSEOValidation,
    validateRequest,
    seoController.update
);

router.delete(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteSEOValidation,
    validateRequest,
    seoController.delete
);

export default router;