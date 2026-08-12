import { body, param } from "express-validator";
import { validateMongoId } from "../../../shared/validators/isMongoId.js";
import { validatePermissionSlug } from "../../../shared/validators/slugs.js";

const ACTIONS = [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "IMPORT",
  "EXPORT",
  "MANAGE",
];

const STATUS = [
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
];

export const createPermissionValidation = [

  body("moduleId")
    .notEmpty()
    .withMessage("Module is required"),

  validateMongoId("moduleId", "body", "Invalid Module Id"),

  body("displayName")
    .trim()
    .notEmpty()
    .withMessage("Display name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Display name must be between 3 and 100 characters"),

  validatePermissionSlug("slug", "body", "Invalid slug"),

  body("action")
    .notEmpty()
    .withMessage("Action is required")
    .isIn(ACTIONS)
    .withMessage("Invalid action"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description can't exceed 500 characters"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be greater than or equal to 0"),

  body("isSystem")
    .optional()
    .isBoolean(),

  body("status")
    .optional()
    .isIn(STATUS)
    .withMessage("Invalid status"),
];

export const updatePermissionValidation = [
  validateMongoId("id", "param", "Invalid Permission Id"),
];

export const deletePermissionValidation = [
  validateMongoId("id", "param", "Invalid Permission Id"),
];