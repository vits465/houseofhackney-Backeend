import { body, param } from "express-validator";

// Validation rules for creating an address
export const createAddressValidation = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ max: 150 })
        .withMessage("Full name cannot exceed 150 characters"),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required"),

    body("email")
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage("Invalid email address"),

    body("country")
        .trim()
        .notEmpty()
        .withMessage("Country is required"),

    body("state")
        .trim()
        .notEmpty()
        .withMessage("State is required"),

    body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),

    body("postalCode")
        .trim()
        .notEmpty()
        .withMessage("Postal code is required"),

    body("addressLine1")
        .trim()
        .notEmpty()
        .withMessage("Address line 1 is required"),

    body("type")
        .optional()
        .isIn(["HOME", "OFFICE", "SHIPPING", "BILLING"])
        .withMessage("Invalid address type"),

    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage("isDefault must be a boolean"),
];

// Validation rules for updating an address
export const updateAddressValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid address ID"),

    ...createAddressValidation.map((rule) => rule.optional()),
];

// Validation rules for param ID
export const addressIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid address ID"),
];
