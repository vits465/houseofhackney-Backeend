import { Router } from "express";

import attributeController from "./attribute.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createAttributeValidation,
    updateAttributeValidation,
    deleteAttributeValidation,
    getAttributeValidation,
    addValueValidation,
    updateValueValidation,
    deleteValueValidation,
} from "./attribute.validation.js";

const router = Router();

// Attribute Crud
    router.get(
    "/",
    attributeController.getAll
);

router.get(
    "/variant",
    attributeController.getVariantAttributes
);

router.get(
    "/filter",
    attributeController.getFilterAttributes
);

router.get(
    "/:id",
    getAttributeValidation,
    validateRequest,
    attributeController.getById
);

router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createAttributeValidation,
    validateRequest,
    attributeController.create
);

router.put(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    updateAttributeValidation,
    validateRequest,
    attributeController.update
);

router.delete(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteAttributeValidation,
    validateRequest,
    attributeController.delete
);

// Attribute Values
    router.get(
    "/:id/values",
    getAttributeValidation,
    validateRequest,
    attributeController.getValues
);

router.post(
    "/:id/values",
    authMiddleware,
    authorize(["ADMIN"]),
    addValueValidation,
    validateRequest,
    attributeController.addValue
);

router.put(
    "/:id/values/:valueId",
    authMiddleware,
    authorize(["ADMIN"]),
    updateValueValidation,
    validateRequest,
    attributeController.updateValue
);

router.delete(
    "/:id/values/:valueId",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteValueValidation,
    validateRequest,
    attributeController.deleteValue
);

export default router;