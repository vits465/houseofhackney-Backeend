import { body, param } from "express-validator";

// Validation rules for creating a company
export const createCompanyValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Company name is required"),

    body("country")
        .trim()
        .notEmpty()
        .withMessage("Country is required"),

    body("taxNumber")
        .optional()
        .trim(),

    body("registrationNumber")
        .optional()
        .trim(),

    body("website")
        .optional()
        .trim(),

    body("email")
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage("Invalid company email address"),
];

// Param ID validation
export const companyIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid company ID"),
];
