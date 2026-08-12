import { Router } from "express";

import addressController from "./address.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createAddressValidation,
    updateAddressValidation,
    addressIdParamValidation,
} from "./address.validation.js";

const router = Router();

// All address operations require authentication
router.use(authMiddleware);

// Get user addresses
router.get(
    "/",
    addressController.getAll
);

// Get single address details
router.get(
    "/:id",
    addressIdParamValidation,
    validateRequest,
    addressController.get
);

// Create new address
router.post(
    "/",
    createAddressValidation,
    validateRequest,
    addressController.create
);

// Update existing address
router.put(
    "/:id",
    updateAddressValidation,
    validateRequest,
    addressController.update
);

// Delete address
router.delete(
    "/:id",
    addressIdParamValidation,
    validateRequest,
    addressController.delete
);

// Set default address
router.patch(
    "/:id/default",
    addressIdParamValidation,
    validateRequest,
    addressController.setDefault
);

export default router;
