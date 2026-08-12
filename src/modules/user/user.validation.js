import { body, param } from "express-validator";

import { validateEmail } from "../../shared/validators/isEmail.js";
import { validatePhone } from "../../shared/validators/isPhone.js";
import { validatePassword } from "../../shared/validators/isPassword.js";
import { validateMongoId } from "../../shared/validators/isMongoId.js";
import { validateName } from "../../shared/validators/isName.js";

import { USER_STATUS, GENDER, ACCOUNT_TYPE } from "../../shared/enums/user.enum.js";

// Create User
    export const
    createUserValidation = [

    validateName("firstName", "body", "Invalid first name"),

    validateName("lastName", "body", "Invalid last name"),

    validateEmail("email", "body", "Invalid email address"),

    body("countryCode")
        .optional()
        .isString(),

    validatePhone("phone", "body", "Invalid phone number", { optional: true }),

    body("password")
        .if(body("loginProvider").equals("EMAIL"))
        .notEmpty()
        .withMessage("Password is required"),

    validatePassword(
        "password",
        "body",
        "Password must contain uppercase, lowercase, number and special character"
    ).if(body("loginProvider").equals("EMAIL")),

    body("gender")
        .optional()
        .isIn(GENDER)
        .withMessage("Invalid gender"),

    body("accountType")
        .optional()
        .isIn(ACCOUNT_TYPE)
        .withMessage("Invalid account type"),

    body("roles")
        .optional()
        .isArray()
        .withMessage("Roles must be an array"),
];

// Update User
    export const
    updateUserValidation = [

    validateMongoId("id", "param", "Invalid user id"),

    validateName("firstName", "body", "Invalid first name", { optional: true }),

    validateName("lastName", "body", "Invalid last name", { optional: true }),

    validatePhone("phone", "body", "Invalid phone number", { optional: true }),

    body("gender")
        .optional()
        .isIn(GENDER),

    body("language")
        .optional()
        .isString(),

    body("currency")
        .optional()
        .isString(),

    body("timezone")
        .optional()
        .isString(),

];

// Login
    export const
    loginValidation = [

    validateEmail("email", "body", "Invalid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")

];

// Social Login
    export const
    socialLoginValidation = [

    body("provider")
        .isIn([
            "GOOGLE",
            "APPLE",
            "FACEBOOK",
        ])
        .withMessage("Invalid provider"),

    body("token")
        .notEmpty()
        .withMessage("Token is required"),

];

// Change Password
    export const
    changePasswordValidation = [

    body("currentPassword")
        .notEmpty(),

    validatePassword(
        "newPassword",
        "body",
        "Password must contain uppercase, lowercase, number and special character"
    ),

    body("confirmPassword")
        .custom((value, { req }) => {

            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match");
            }

            return true;

        }),

];

// Forgot Password
    export const
    forgotPasswordValidation = [

    validateEmail("email", "body", "Invalid email"),

];

// Reset Password
    export const
    resetPasswordValidation = [

    body("token")
        .notEmpty(),

    validatePassword(
        "password",
        "body",
        "Invalid password"
    ),

    body("confirmPassword")
        .custom((value, { req }) => {

            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }

            return true;

        }),

];

// Verify Email
    export const
    verifyEmailValidation = [

    validateEmail("email", "body", "Invalid email"),

    body("otp")
        .isLength({
            min: 6,
            max: 6,
        }),

];

// Verify Phone
    export const
    verifyPhoneValidation = [

    validatePhone("phone", "body", "Invalid phone number"),

    body("otp")
        .isLength({
            min: 6,
            max: 6,
        }),

];

// Change Status
    export const
    changeStatusValidation = [

    validateMongoId("id"),

    body("status")
        .isIn(USER_STATUS),

];

// Assign Role
    export const
    assignRoleValidation = [

    validateMongoId("id"),

    body("roles")
        .isArray(),

];

// Delete User
    export const
    deleteUserValidation = [

    validateMongoId("id"),

];