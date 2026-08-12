import { body, param } from "express-validator";
import { validateMongoId } from "../../../shared/validators/isMongoId.js";
import { validateSlug } from "../../../shared/validators/slugs.js";

const STATUS = [
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
];

export const createRoleValidation = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Role name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Role name must be between 2 and 50 characters"),

  body("displayName")
    .trim()
    .notEmpty()
    .withMessage("Display name is required")
    .isLength({ min: 2, max: 100 }),

  validateSlug("slug", "body", "Invalid slug"),

  body("description")
    .optional()
    .isLength({ max: 500 }),

  body("priority")
    .optional()
    .isInt({ min: 1 }),

  body("level")
    .optional()
    .isInt({ min: 1 }),

  body("permissions")
    .optional()
    .isArray(),

  body("allowedModules")
    .optional()
    .isArray(),

  body("isDefault")
    .optional()
    .isBoolean(),

  body("isSystem")
    .optional()
    .isBoolean(),

  body("canLoginAdmin")
    .optional()
    .isBoolean(),

  body("canLoginWebsite")
    .optional()
    .isBoolean(),

  body("status")
    .optional()
    .isIn(STATUS)

];

export const updateRoleValidation = [

  validateMongoId("id", "param", "Invalid Role Id"),

];

export const deleteRoleValidation = [

  validateMongoId("id", "param", "Invalid Role Id"),

];