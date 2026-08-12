import { Router } from "express";
import authController from "./auth.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";
import { createRateLimiter } from "../../../middlewares/rateLimit.middleware.js";
import {
  registerValidation,
  verifyEmailValidation,
  resendOtpValidation,
  loginValidation,
  refreshTokenValidation,
  forgotPasswordValidation,
  verifyResetOtpValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from "./auth.validation.js";

const router = Router();

// Rate limiters for sensitive endpoints
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

const otpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many OTP requests. Please wait before requesting again.",
});

// Public auth routes
router.post(
  "/register",
  registerValidation,
  validateRequest,
  authController.register
);

router.post(
  "/verify-email",
  verifyEmailValidation,
  validateRequest,
  authController.verifyEmail
);

router.post(
  "/resend-otp",
  otpLimiter,
  resendOtpValidation,
  validateRequest,
  authController.resendOtp
);

router.post(
  "/login",
  loginLimiter,
  loginValidation,
  validateRequest,
  authController.login
);

router.post(
  "/refresh",
  refreshTokenValidation,
  validateRequest,
  authController.refreshToken
);

router.post(
  "/forgot-password",
  otpLimiter,
  forgotPasswordValidation,
  validateRequest,
  authController.forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyResetOtpValidation,
  validateRequest,
  authController.verifyResetOtp
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  authController.resetPassword
);

// Protected routes (requires auth token)
router.use(authMiddleware);

router.post("/logout", authController.logout);

router.patch(
  "/change-password",
  changePasswordValidation,
  validateRequest,
  authController.changePassword
);

router.get("/me", authController.getMe);
router.get("/sessions", authController.getSessions);
router.post("/sessions/revoke", authController.revokeSession);
router.post("/sessions/revoke-others", authController.revokeOtherSessions);

export default router;
