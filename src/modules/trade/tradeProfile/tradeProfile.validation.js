import { body, param } from "express-validator";

// Validation rules for trade application
export const applyTradeValidation = [
    body().custom((val, { req }) => {
        const phone = req.body.phone || req.body.companyPhone;
        if (!phone || !phone.toString().trim()) {
            throw new Error("Contact phone is required");
        }
        return true;
    }),

    body("businessType")
        .optional()
        .isIn([
            "INTERIOR_DESIGNER",
            "ARCHITECT",
            "HOTEL_HOSPITALITY",
            "HOSPITALITY",
            "RETAILER",
            "CONTRACTOR",
            "OTHER",
        ])
        .withMessage("Invalid business type"),

    body("gstNumber")
        .optional()
        .trim(),

    body("vatNumber")
        .optional()
        .trim(),

    body("companyName")
        .optional()
        .trim(),

    body("companyPhone")
        .optional()
        .trim(),

    body("phone")
        .optional()
        .trim(),
];

// Validation rules for reviewing trade application (Admin)
export const reviewTradeValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid application ID"),

    body("status")
        .isIn(["APPROVED", "REJECTED", "UNDER_REVIEW"])
        .withMessage("Status must be APPROVED, REJECTED, or UNDER_REVIEW"),

    body("tierId")
        .optional()
        .isMongoId()
        .withMessage("Invalid tier ID"),

    body("creditLimit")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Credit limit must be a positive number"),

    body("rejectionReason")
        .optional()
        .trim(),
];

// Param ID validation
export const profileIdParamValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid application ID"),
];
