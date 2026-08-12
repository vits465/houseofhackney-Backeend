import express from "express";

import moduleController from "./module.controller.js";

import {
  createModuleValidation,
  updateModuleValidation,
  deleteModuleValidation,
} from "./module.validation.js";

import validateRequest from "../../../middlewares/validateRequest.js";

const router = express.Router();

// Create
    router.post(
  "/",
  createModuleValidation,
  validateRequest,
  moduleController.createModule
);

// Get All
    router.get("/", moduleController.getAllModules);

// Get One
    router.get("/:id", moduleController.getModuleById);

// Update
    router.patch(
  "/:id",
  updateModuleValidation,
  validateRequest,
  moduleController.updateModule
);

// Delete
    router.delete(
  "/:id",
  deleteModuleValidation,
  validateRequest,
  moduleController.deleteModule
);

export default router;