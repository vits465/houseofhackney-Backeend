import { Router } from "express";

import categoryController from "./category.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createCategoryValidation,
    updateCategoryValidation,
    deleteCategoryValidation,
    getCategoryValidation,
} from "./category.validation.js";

const router = Router();

router.get(
    "/",
    categoryController.getAll
);

router.get(
    "/:id",
    getCategoryValidation,
    validateRequest,
    categoryController.getById
);

router.post(
    "/",
    authMiddleware,
    authorize(["ADMIN"]),
    createCategoryValidation,
    validateRequest,
    categoryController.create
);

router.put(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    updateCategoryValidation,
    validateRequest,
    categoryController.update
);

router.delete(
    "/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    deleteCategoryValidation,
    validateRequest,
    categoryController.delete
);

export default router;