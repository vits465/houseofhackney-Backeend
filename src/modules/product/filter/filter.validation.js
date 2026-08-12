import { body, query } from "express-validator";

export const filterGroupValidation = [
  body("name").trim().notEmpty().withMessage("Filter group name is required"),
  body("code").trim().notEmpty().withMessage("Filter group code is required"),
  body("type")
    .optional()
    .isIn(["SINGLE_SELECT", "MULTI_SELECT", "RANGE", "COLOR_SWATCH"])
    .withMessage("Invalid filter group type"),
  body("options").optional().isArray().withMessage("Options must be an array"),
];

export const facetQueryValidation = [
  query("minPrice").optional().isNumeric().withMessage("minPrice must be a number"),
  query("maxPrice").optional().isNumeric().withMessage("maxPrice must be a number"),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be an integer >= 1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];
