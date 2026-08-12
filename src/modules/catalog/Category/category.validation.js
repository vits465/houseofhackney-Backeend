import { body, param } from "express-validator";

import { validateMongoId } from "../../../shared/validators/isMongoId.js";
import { validateSlug } from "../../../shared/validators/slugs.js";

export const createCategoryValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Category name is required.")
        .isLength({ min: 2, max: 100 })
        .withMessage("Category name must be between 2 and 100 characters."),

    body("description")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Description cannot exceed 1000 characters."),

    validateMongoId(
        "parentCategory",
        "body",
        "Invalid parent category.",
        { optional: true }
    ),

    body("showInMenu")
        .optional()
        .isBoolean(),

    body("isFeatured")
        .optional()
        .isBoolean(),

    body("sortOrder")
        .optional()
        .isInt({ min: 0 }),

    body("status")
        .optional()
        .isIn(["ACTIVE", "INACTIVE"])

];

export const updateCategoryValidation = [

    validateMongoId("id", "param", "Invalid category id."),

];

export const deleteCategoryValidation = [

    validateMongoId("id", "param", "Invalid category id."),

];

export const getCategoryValidation = [

    validateMongoId("id", "param", "Invalid category id."),

];

export const getCategoryBySlugValidation = [

    validateSlug(
        "slug",
        "param",
        "Invalid category slug."
    ),

];