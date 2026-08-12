import { body } from "express-validator";
import { validateMongoId } from "../../../shared/validators/isMongoId.js";

export const getReviewsValidation = [
    validateMongoId("productId", "param", "Invalid product id"),
];

export const createReviewValidation = [
    body("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),

    body("comment")
        .trim()
        .notEmpty()
        .withMessage("Comment is required")
        .isLength({ max: 3000 })
        .withMessage("Comment cannot exceed 3000 characters"),

    body("title")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Title cannot exceed 150 characters"),

    body("variant")
        .optional()
        .isMongoId()
        .withMessage("Invalid variant id"),

    body("order")
        .optional()
        .isMongoId()
        .withMessage("Invalid order id"),

    body("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array of Media ObjectIds"),
];

export const updateReviewValidation = [
    validateMongoId("id", "param", "Invalid review id"),

    body("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),

    body("comment")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Comment cannot be empty")
        .isLength({ max: 3000 })
        .withMessage("Comment cannot exceed 3000 characters"),
];

export const adminReplyValidation = [
    validateMongoId("id", "param", "Invalid review id"),

    body("message")
        .trim()
        .notEmpty()
        .withMessage("Reply message is required")
        .isLength({ max: 1000 })
        .withMessage("Reply message cannot exceed 1000 characters"),
];

export const updateStatusValidation = [
    validateMongoId("id", "param", "Invalid review id"),

    body("status")
        .isIn(["PENDING", "APPROVED", "REJECTED", "SPAM"])
        .withMessage("Status must be PENDING, APPROVED, REJECTED, or SPAM"),
];

export const reviewIdParamValidation = [
    validateMongoId("id", "param", "Invalid review id"),
];
