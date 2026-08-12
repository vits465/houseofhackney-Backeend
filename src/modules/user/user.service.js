import bcrypt from "bcrypt";
import BaseService from "../../shared/database/BaseService.js";
import userRepository from "./user.repository.js";
import roleRepository from "../auth/role/role.repository.js";
import otpService from "../auth/otp/otp.service.js";
import emailService from "../auth/otp/email.service.js";
import AppError from "../../shared/errors/AppError.js";

class UserService extends BaseService {
  constructor() {
    super(userRepository);
  }

  // Override update to hash passwords safely
  async update(userId, updateData) {
    if (updateData.password && !/^\$2[aby]\$\d{2}\$/.test(updateData.password)) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(updateData.password, salt);
      updateData.passwordChangedAt = new Date();
      updateData.tokenVersion = (updateData.tokenVersion || 1) + 1;
    }
    return await this.repository.update(userId, updateData);
  }

  // Create User
  async createUser(userData) {
    const emailExists = await this.isEmailExists(userData.email);

    if (emailExists) {
      throw new AppError("Email already registered.", 409);
    }

    const phoneExists = await this.isPhoneExists(userData.phone);

    if (phoneExists) {
      throw new AppError("Phone already registered.", 409);
    }

    // Assign Default Customer Role
    if (!userData.roles || userData.roles.length === 0) {
      let customerRole = await roleRepository.findOne({
        slug: "customer",
      });

      if (!customerRole) {
        customerRole = await roleRepository.create({
          name: "CUSTOMER",
          displayName: "Customer",
          slug: "customer",
          description: "Default customer role",
          permissions: [],
          priority: 100,
          level: 1,
          isDefault: true,
          isSystem: false,
          canLoginAdmin: false,
          canLoginWebsite: true,
          status: "ACTIVE",
        });
      }

      userData.roles = [customerRole._id];
    }

    const user = await this.repository.create(userData);

    // Dispatch OTP & Welcome emails
    if (user && user.email) {
      const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer";
      otpService.generateAndSendOtp({
        email: user.email,
        name: userName,
        purpose: "EMAIL_VERIFICATION",
      }).catch((err) => console.warn("OTP dispatch error on user creation:", err.message));

      emailService.sendWelcomeEmail({
        to: user.email,
        name: userName,
      }).catch((err) => console.warn("Welcome email dispatch error on user creation:", err.message));
    }

    return user;
  }

  // Wrapper for controller compatibility
  async registerUser(userData) {
    return this.createUser(userData);
  }

  // Find User By ID
  async findById(userId) {
    return await this.repository.findById(userId);
  }

  // Find User By Email
  async findByEmail(email) {
    return await this.repository.findByEmail(email);
  }

  // Check Email Exists
  async isEmailExists(email) {
    return await this.repository.existsByEmail(email);
  }

  // Check Phone Exists
  async isPhoneExists(phone) {
    if (!phone) return false;
    return await this.repository.existsByPhone(phone);
  }

  // Update Last Login
  async updateLastLogin(userId) {
    return await this.repository.updateLastLogin(userId);
  }

  // Increase Login Attempts
  async increaseLoginAttempts(userId) {
    return await this.repository.increaseLoginAttempts(userId);
  }

  // Reset Login Attempts
  async resetLoginAttempts(userId) {
    return await this.repository.resetLoginAttempts(userId);
  }

  // Increment Token Version
  async incrementTokenVersion(userId) {
    return await this.repository.incrementTokenVersion(userId);
  }
}

export default new UserService();
