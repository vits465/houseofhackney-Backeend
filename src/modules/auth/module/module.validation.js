import { body, param, validationResult } from "express-validator";
import { validateSlug } from "../../../shared/validators/slugs.js";
import { validateMongoId } from "../../../shared/validators/isMongoId.js";

export const createModuleValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Module name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Module name must be between 2 and 50 characters"),

  validateSlug("slug", "body", "Slug can only contain lowercase letters, numbers and hyphens"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  validateMongoId("parentModuleId", "body", "Invalid parent module id", { optional: true }),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a positive integer"),

  body("displayInSidebar")
    .optional()
    .isBoolean()
    .withMessage("displayInSidebar must be boolean"),

  body("isSystem")
    .optional()
    .isBoolean()
    .withMessage("isSystem must be boolean"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
    .withMessage("Invalid status"),
];

export const updateModuleValidation = [
  validateMongoId("id", "param", "Invalid module id"),
];

export const deleteModuleValidation = [
  validateMongoId("id", "param", "Invalid module id"),
];
