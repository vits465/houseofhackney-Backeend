import userService from "../../user/user.service.js";
import sessionService from "../session/session.service.js";
import tokenService from "../token/token.service.js";
import otpService from "../otp/otp.service.js";
import emailService from "../otp/email.service.js";
import AppError from "../../../shared/errors/AppError.js";
import jwt from "jsonwebtoken";
import companyRepository from "../../trade/Company/company.repository.js";
import tradeProfileRepository from "../../trade/tradeProfile/tradeProfile.repository.js";

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
    const normalizedEmail = email.trim().toLowerCase();

    // This verifies and consumes the OTP exactly once.
    await otpService.verifyOtp({
      email: normalizedEmail,
      purpose: "PASSWORD_RESET",
      otp,
    });

    // Issue a short-lived token only for password resetting.
    const resetToken = jwt.sign(
      {
        email: normalizedEmail,
        purpose: "PASSWORD_RESET",
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "5m",
        issuer: "house-of-hackney",
        audience: "password-reset",
      }
    );

    return {
      message: "Reset OTP verified successfully.",
      email: normalizedEmail,
      resetToken,
      expiresInSeconds: 300,
    };
  }

  // Reset Password
  async resetPassword({ email, resetToken, newPassword }) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!resetToken || !newPassword) {
      throw new AppError(
        "Reset authorization token and new password are required.",
        400
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_ACCESS_SECRET,
        {
          issuer: "house-of-hackney",
          audience: "password-reset",
        }
      );
    } catch {
      throw new AppError(
        "Password reset authorization is invalid or expired. Please verify a new OTP.",
        401
      );
    }

    if (
      decoded.purpose !== "PASSWORD_RESET" ||
      decoded.email !== normalizedEmail
    ) {
      throw new AppError(
        "Invalid password reset authorization.",
        401
      );
    }

    const user = await userService.findByEmail(normalizedEmail);

    if (!user) {
      throw new AppError("User account not found.", 404);
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    await user.save();

    // Revoke existing login sessions after password reset.
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

  // Dedicated Trade Account Registration
  async tradeRegister(tradeData, sessionData = {}) {
    const {
      firstName,
      lastName,
      email,
      password,
      companyName,
      businessType = "INTERIOR_DESIGNER",
      website = "",
      taxId = "",
      notes = "",
      countryCode = "+91",
    } = tradeData;

    const contactPhone = (tradeData.phone || tradeData.companyPhone || "").toString().trim();

    if (!companyName || !companyName.trim()) {
      throw new AppError("Company or Studio name is required for trade registration.", 400);
    }
    if (!contactPhone) {
      throw new AppError("Contact phone number is required.", 400);
    }

    // 1. Create User with trade properties
    const user = await userService.registerUser({
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: email?.trim().toLowerCase(),
      password,
      phone: contactPhone,
      countryCode,
      accountType: "BUSINESS",
      isTradeAccount: true,
    });

    if (!user) {
      throw new AppError("Unable to create user account.", 500);
    }

    // 2. Create Company & Trade Profile
    try {
      const company = await companyRepository.create({
        name: companyName.trim(),
        phone: contactPhone,
        website: website ? website.trim() : "",
        taxNumber: taxId ? taxId.trim() : "",
        country: tradeData.country || "India",
        createdBy: user._id,
      });

      const normalizedBusinessType =
        businessType === "HOSPITALITY" ? "HOTEL_HOSPITALITY" : businessType;

      const profile = await tradeProfileRepository.create({
        user: user._id,
        company: company._id,
        phone: contactPhone,
        businessType: normalizedBusinessType,
        website: website ? website.trim() : "",
        gstNumber: taxId ? taxId.trim() : "",
        status: "PENDING",
        rejectionReason: notes ? notes.trim() : "",
        createdBy: user._id,
      });

      user.tradeProfile = profile._id;
      user.isTradeAccount = true;
      user.accountType = "BUSINESS";
      await user.save();
    } catch (err) {
      console.warn("Trade profile creation warning during trade registration:", err.message);
    }

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Trade Partner";

    // 3. Send Verification OTP
    let otpResult;
    try {
      otpResult = await otpService.generateAndSendOtp({
        email: user.email,
        name: userName,
        purpose: "EMAIL_VERIFICATION",
      });
    } catch (err) {
      console.warn("OTP generation warning during trade registration:", err.message);
    }

    return {
      message: "Trade registration successful. Please check your email for the verification OTP.",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
        isTradeAccount: user.isTradeAccount,
        isEmailVerified: user.isEmailVerified || false,
      },
      emailVerificationSent: !!otpResult,
    };
  }
}

export default new AuthService();
