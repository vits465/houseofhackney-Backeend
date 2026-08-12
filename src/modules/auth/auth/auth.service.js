import userService from "../../user/user.service.js";
import sessionService from "../session/session.service.js";
import tokenService from "../token/token.service.js";
import otpService from "../otp/otp.service.js";
import emailService from "../otp/email.service.js";
import AppError from "../../../shared/errors/AppError.js";

class AuthService {
  // Register User & Trigger Email Verification OTP
  async register(userData) {
    const user = await userService.registerUser(userData);

    if (!user) {
      throw new AppError("Unable to create user account.", 500);
    }

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer";

    // Generate and send Email Verification OTP
    let otpResult;
    try {
      otpResult = await otpService.generateAndSendOtp({
        email: user.email,
        name: userName,
        purpose: "EMAIL_VERIFICATION",
      });
    } catch (err) {
      console.warn("OTP generation warning during registration:", err.message);
    }

    return {
      message: "Registration successful. Please check your email for the verification OTP.",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified || false,
      },
      emailVerificationSent: !!otpResult,
    };
  }

  // Verify Email OTP & Issue Login Session
  async verifyEmail({ email, otp }, sessionData = {}) {
    await otpService.verifyOtp({
      email,
      purpose: "EMAIL_VERIFICATION",
      otp,
    });

    const user = await userService.findByEmail(email);
    if (!user) {
      throw new AppError("User account not found.", 404);
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer";

    // Send Welcome Email now that email address is verified
    emailService.sendWelcomeEmail({
      to: user.email,
      name: userName,
    }).catch((err) => console.error("Welcome email delivery error:", err.message));

    // Generate JWT Tokens & Create Initial Session upon successful email verification
    const tokens = tokenService.generateTokenPair({
      sub: user._id,
      email: user.email,
      roles: user.roles,
      tokenVersion: user.tokenVersion || 1,
    });

    if (sessionData.deviceId) {
      await sessionService.createSession({
        user: user._id,
        refreshToken: tokens.refreshToken,
        deviceId: sessionData.deviceId,
        deviceName: sessionData.deviceName,
        deviceType: sessionData.deviceType,
        browser: sessionData.browser,
        operatingSystem: sessionData.operatingSystem,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        location: sessionData.location,
      });
    }

    return {
      message: "Email address verified successfully. Welcome to House of Hackney!",
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Resend OTP
  async resendOtp({ email, purpose }) {
    const user = await userService.findByEmail(email);
    if (!user) {
      throw new AppError("User account not found.", 404);
    }

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer";

    return await otpService.generateAndSendOtp({
      email,
      purpose,
      name: userName,
    });
  }

  // Login
  async login(loginData, sessionData) {
    const { email, password } = loginData;

    const user = await userService.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("Your account is inactive or suspended.", 403);
    }

    // Check Account Lock Status (5 failed attempts -> 15 min lock)
    if (user.isLocked && user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockUntil).getTime() - Date.now()) / 60000
      );
      throw new AppError(
        `Account is temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minutes.`,
        423
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const updatedUser = await userService.increaseLoginAttempts(user._id);

      // Lock account if login attempts >= 5
      if (updatedUser && updatedUser.loginAttempts >= 5) {
        updatedUser.isLocked = true;
        updatedUser.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await updatedUser.save();
        throw new AppError(
          "Account has been locked for 15 minutes due to 5 consecutive failed login attempts.",
          423
        );
      }

      throw new AppError("Invalid email or password.", 401);
    }

    // Require Email Verification before Login
    if (!user.isEmailVerified) {
      const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer";
      await otpService.generateAndSendOtp({
        email: user.email,
        name: userName,
        purpose: "EMAIL_VERIFICATION",
      }).catch((e) => console.warn("Re-send OTP error on login:", e.message));

      throw new AppError(
        "Your email address is not verified yet. A verification OTP has been sent to your email address.",
        403
      );
    }

    // Reset Login Attempts on Successful Auth
    await userService.resetLoginAttempts(user._id);
    await userService.updateLastLogin(user._id);

    // Issue Token Pair
    const tokens = tokenService.generateTokenPair({
      sub: user._id,
      email: user.email,
      roles: user.roles,
      tokenVersion: user.tokenVersion || 1,
    });

    // Save Session
    await sessionService.createSession({
      user: user._id,
      refreshToken: tokens.refreshToken,
      deviceId: sessionData.deviceId,
      deviceName: sessionData.deviceName,
      deviceType: sessionData.deviceType,
      browser: sessionData.browser,
      operatingSystem: sessionData.operatingSystem,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      location: sessionData.location,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Refresh Token
  async refreshToken(refreshTokenInput, sessionData) {
    if (!refreshTokenInput) {
      throw new AppError("Refresh token is required.", 400);
    }

    let decoded;
    try {
      decoded = tokenService.verifyRefreshToken(refreshTokenInput);
    } catch (err) {
      throw new AppError("Invalid or expired refresh token.", 401);
    }
    const session = await sessionService.validateSession(refreshTokenInput);

    if (!session) {
      throw new AppError("Invalid or expired session. Please log in again.", 401);
    }

    const user = await userService.findById(decoded.sub);
    if (!user || user.status !== "ACTIVE") {
      throw new AppError("User account no longer active.", 401);
    }

    if (decoded.tokenVersion && decoded.tokenVersion !== user.tokenVersion) {
      await sessionService.revokeSessionById(session._id);
      throw new AppError("Session invalidated due to password change.", 401);
    }

    const tokens = tokenService.generateTokenPair({
      sub: user._id,
      email: user.email,
      roles: user.roles,
      tokenVersion: user.tokenVersion || 1,
    });

    await sessionService.updateSessionToken(session._id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Logout
  async logout(refreshTokenInput, user) {
    if (refreshTokenInput) {
      await sessionService.revokeSessionByToken(refreshTokenInput);
    } else if (user && user._id) {
      await sessionService.revokeAllUserSessions(user._id);
    }
    return { message: "Logged out successfully." };
  }

  // Forgot Password
  async forgotPassword(email) {
    const user = await userService.findByEmail(email);
    if (!user) {
      return {
        message: "If an account exists for this email, a password reset OTP has been sent.",
      };
    }

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer";

    await otpService.generateAndSendOtp({
      email: user.email,
      name: userName,
      purpose: "PASSWORD_RESET",
    });

    return {
      message: "Password reset OTP sent to your email address.",
    };
  }

  // Verify Reset OTP
  async verifyResetOtp({ email, otp }) {
    await otpService.verifyOtp({
      email,
      purpose: "PASSWORD_RESET",
      otp,
    });

    return {
      message: "Reset OTP verified successfully. You may now reset your password.",
      email,
    };
  }

  // Reset Password
  async resetPassword({ email, otp, newPassword }) {
    await otpService.verifyOtp({
      email,
      purpose: "PASSWORD_RESET",
      otp,
    });

    const user = await userService.findByEmail(email);
    if (!user) {
      throw new AppError("User account not found.", 404);
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    await user.save();

    await sessionService.revokeAllUserSessions(user._id);

    return {
      message: "Password reset successfully. Please log in with your new password.",
    };
  }

  // Change Password
  async changePassword(userId, { currentPassword, newPassword }, currentRefreshToken) {
    const user = await userService.findById(userId, "+password");
    if (!user) {
      throw new AppError("User account not found.", 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect.", 400);
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    await user.save();

    if (currentRefreshToken) {
      await sessionService.revokeOtherSessions(userId, currentRefreshToken);
    } else {
      await sessionService.revokeAllUserSessions(userId);
    }

    return {
      message: "Password changed successfully. Other active sessions have been revoked.",
    };
  }

  // Get Current User (Me)
  async getMe(userId) {
    const user = await userService.findById(userId);
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    return user;
  }

  // Get User Active Sessions
  async getUserSessions(userId) {
    return sessionService.getActiveUserSessions(userId);
  }

  // Revoke Session
  async revokeSession(userId, sessionId) {
    return sessionService.revokeSessionById(sessionId);
  }

  // Revoke Other Sessions
  async revokeOtherSessions(userId, currentRefreshToken) {
    return sessionService.revokeOtherSessions(userId, currentRefreshToken);
  }
}

export default new AuthService();
