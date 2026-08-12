import { body, param } from "express-validator";

import {
    isMongoId
} from "../../shared/validators/index.js";

// Create Session
    export const
    createSessionValidation = [

    body("refreshToken")
        .notEmpty()
        .withMessage("Refresh token is required"),

    body("deviceId")
        .notEmpty()
        .withMessage("Device ID is required"),

];

// Refresh Token
    export const
    refreshTokenValidation = [

    body("refreshToken")
        .notEmpty()
        .withMessage("Refresh token is required"),

];

// Logout
    export const
    logoutValidation = [

    body("refreshToken")
        .notEmpty()
        .withMessage("Refresh token is required"),

];

// Logout All Devices
    export const
    logoutAllValidation = [

    isMongoId("userId"),

];

// Revoke Session
    export const
    revokeSessionValidation = [

    isMongoId("id"),

];