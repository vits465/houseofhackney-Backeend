import { Router } from "express";

import relatedController from "./related.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    getRelatedValidation,
    createRelatedValidation,
    updateRelatedValidation,
    addItemValidation,
    removeItemValidation,
    deleteRelatedValidation,
} from "./related.validation.js";

const router = Router({ mergeParams: true });

router.get(
    "/",
    getRelatedValidation,
    validateRequest,
    relatedController.get
);

router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createRelatedValidation,
    validateRequest,
    relatedController.create
);

router.put(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    updateRelatedValidation,
    validateRequest,
    relatedController.update
);

router.post(
    "/items",
    authMiddleware,
    authorize(["ADMIN"]),
    addItemValidation,
    validateRequest,
    relatedController.addItem
);

router.delete(
    "/items/:targetProductId",
    authMiddleware,
    authorize(["ADMIN"]),
    removeItemValidation,
    validateRequest,
    relatedController.removeItem
);

router.delete(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteRelatedValidation,
    validateRequest,
    relatedController.delete
);

export default router;
