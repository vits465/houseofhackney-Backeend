import express from "express";
import permissionController from "./permission.controller.js";
import {
  createPermissionValidation,
  updatePermissionValidation,
  deletePermissionValidation,
} from "./permission.validation.js";
import validateRequest from "../../../middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  createPermissionValidation,
  validateRequest,
  permissionController.createPermission
);

router.get("/", permissionController.getAllPermissions);

router.get("/:id", permissionController.getPermissionById);

router.patch(
  "/:id",
  updatePermissionValidation,
  validateRequest,
  permissionController.updatePermission
);

router.delete(
  "/:id",
  deletePermissionValidation,
  validateRequest,
  permissionController.deletePermission
);

export default router;