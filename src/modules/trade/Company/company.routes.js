import { Router } from "express";

import companyController from "./company.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createCompanyValidation,
    companyIdParamValidation,
} from "./company.validation.js";

const router = Router();

// All company routes require authentication
router.use(authMiddleware);

// Get all companies
router.get(
    "/",
    companyController.getAll
);

// Get company details by ID
router.get(
    "/:id",
    companyIdParamValidation,
    validateRequest,
    companyController.getById
);

// Register a new company
router.post(
    "/",
    createCompanyValidation,
    validateRequest,
    companyController.create
);

// Update company details (Admin)
router.put(
    "/:id",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    companyIdParamValidation,
    validateRequest,
    companyController.update
);

// Delete company (Admin)
router.delete(
    "/:id",
    authorize(["ADMIN", "SUPER_ADMIN"]),
    companyIdParamValidation,
    validateRequest,
    companyController.delete
);

export default router;
