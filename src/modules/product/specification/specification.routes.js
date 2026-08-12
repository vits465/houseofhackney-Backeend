import { Router } from "express";

import specificationController from "./specification.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createSpecificationValidation,
    updateSpecificationValidation,
    deleteSpecificationValidation,
    getSpecificationValidation,
} from "./specification.validation.js";

const router = Router({ mergeParams: true });

router.get(
    "/",
    getSpecificationValidation,
    validateRequest,
    specificationController.get
);

router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createSpecificationValidation,
    validateRequest,
    specificationController.create
);

router.put(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    updateSpecificationValidation,
    validateRequest,
    specificationController.update
);

router.delete(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteSpecificationValidation,
    validateRequest,
    specificationController.delete
);

export default router;
