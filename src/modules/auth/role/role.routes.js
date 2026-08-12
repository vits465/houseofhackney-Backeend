import express from "express";

import roleController from "./role.controller.js";

import {
  createRoleValidation,
  updateRoleValidation,
  deleteRoleValidation,
} from "./role.validation.js";

import validateRequest from "../../../middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  createRoleValidation,
  validateRequest,
  roleController.createRole
);

router.get("/", roleController.getAllRoles);

router.get("/:id", roleController.getRoleById);

router.patch(
  "/:id",
  updateRoleValidation,
  validateRequest,
  roleController.updateRole
);

router.delete(
  "/:id",
  deleteRoleValidation,
  validateRequest,
  roleController.deleteRole
);

export default router;