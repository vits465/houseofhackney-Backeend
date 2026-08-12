import { Router } from "express";

import userController from "./user.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

import {
    createUserValidation,
    updateUserValidation,
    deleteUserValidation
} from "./user.validation.js";

import validateRequest from "../../middlewares/validateRequest.js";

const router = Router();

// User Routes / Register User
    router.post(
    "/register",
    createUserValidation,
    validateRequest,
    userController.register
);

// Get All Users
    router.get(
    "/",
    userController.getAll
);

// Get User By ID
    router.get(
    "/:id",
    userController.getById
);

// Update User
    router.put(
    "/:id",
    updateUserValidation,
    validateRequest,
    userController.update
);

// Delete User
    router.delete(
    "/:id",
    deleteUserValidation,
    validateRequest,
    userController.delete
);

export default router;