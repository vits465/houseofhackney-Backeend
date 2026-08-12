import crypto from "crypto";
import authService from "./auth.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class AuthController {
  #extractSessionData(req) {
    return {
      deviceId: req.headers["x-device-id"] || req.ip || crypto.randomUUID(),
      deviceName: req.headers["x-device-name"] || "Unknown Device",
      deviceType: (req.headers["x-device-type"] || "DESKTOP").toString().toUpperCase(),
      browser: req.headers["sec-ch-ua"] || null,
      operatingSystem: req.headers["sec-ch-ua-platform"] || null,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      location: null,
    };
  }

  // Register
  register = async (req, res, next) => {
    try {
      const sessionData = this.#extractSessionData(req);
      const result = await authService.register(req.body, sessionData);

      return new ApiResponse(res, 201, result.message, result).send();
    } catch (error) {
      next(error);
    }
  };

  // Verify Email OTP
  verifyEmail = async (req, res, next) => {
    try {
      const sessionData = this.#extractSessionData(req);
      const result = await authService.verifyEmail(req.body, sessionData);
      return new ApiResponse(res, 200, result.message, result).send();
    } catch (error) {
      next(error);
    }
  };

  // Resend OTP
  resendOtp = async (req, res, next) => {
    try {
      const result = await authService.resendOtp(req.body);
      return new ApiResponse(res, 200, "OTP sent successfully.", result).send();
    } catch (error) {
      next(error);
    }
  };

  // Login
  login = async (req, res, next) => {
    try {
      const sessionData = this.#extractSessionData(req);
      const result = await authService.login(req.body, sessionData);

      return new ApiResponse(res, 200, "Login successful.", result).send();
    } catch (error) {
      next(error);
    }
  };

  // Refresh Token
  refreshToken = async (req, res, next) => {
    try {
      const sessionData = this.#extractSessionData(req);
      const refreshTokenInput = req.body.refreshToken || req.headers["x-refresh-token"];

      const result = await authService.refreshToken(refreshTokenInput, sessionData);
      return new ApiResponse(res, 200, "Token refreshed successfully.", result).send();
    } catch (error) {
      next(error);
    }
  };

  // Logout
  logout = async (req, res, next) => {
    try {
      const refreshTokenInput = req.body.refreshToken || req.headers["x-refresh-token"];
      const result = await authService.logout(refreshTokenInput, req.user);

      return new ApiResponse(res, 200, "Logout successful.", result).send();
    } catch (error) {
      next(error);
    }
  };

  // Forgot Password
  forgotPassword = async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return new ApiResponse(res, 200, result.message, result).send();
    } catch (error) {
      next(error);
    }
  };

  // Verify Reset OTP
  verifyResetOtp = async (req, res, next) => {
    try {
      const result = await authService.verifyResetOtp(req.body);
      return new ApiResponse(res, 200, result.message, result).send();
    } catch (error) {
      next(error);
    }
  };

  // Reset Password
  resetPassword = async (req, res, next) => {
    try {
      const result = await authService.resetPassword(req.body);
      return new ApiResponse(res, 200, result.message, result).send();
    } catch (error) {
      next(error);
    }
  };

  // Change Password
  changePassword = async (req, res, next) => {
    try {
      const refreshTokenInput = req.body.refreshToken || req.headers["x-refresh-token"];
      const result = await authService.changePassword(
        req.user._id,
        req.body,
        refreshTokenInput
      );

      return new ApiResponse(res, 200, result.message, result).send();
    } catch (error) {
      next(error);
    }
  };

  // Get Current User Profile
  getMe = async (req, res, next) => {
    try {
      const result = await authService.getMe(req.user._id);
      return new ApiResponse(res, 200, "Current user fetched successfully.", result).send();
    } catch (error) {
      next(error);
    }
  };

  // Get User Sessions
  getSessions = async (req, res, next) => {
    try {
      const result = await authService.getUserSessions(req.user._id);
      return new ApiResponse(res, 200, "Active sessions retrieved.", result).send();
    } catch (error) {
      next(error);
    }
  };

  // Revoke Session
  revokeSession = async (req, res, next) => {
    try {
      const { sessionId } = req.body;
      const result = await authService.revokeSession(req.user._id, sessionId);
      return new ApiResponse(res, 200, "Session revoked successfully.", result).send();
    } catch (error) {
      next(error);
    }
  };

  // Revoke Other Sessions
  revokeOtherSessions = async (req, res, next) => {
    try {
      const refreshTokenInput = req.body.refreshToken || req.headers["x-refresh-token"];
      const result = await authService.revokeOtherSessions(req.user._id, refreshTokenInput);
      return new ApiResponse(res, 200, "Other active sessions revoked.", result).send();
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();