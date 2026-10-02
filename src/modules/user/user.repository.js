import BaseRepository from "../../shared/database/BaseRepository.js";
import User from "./user.model.js";
import { USER_POPULATE } from "../../shared/populate/user.populate.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(User, USER_POPULATE);
  }

  // Find User By Email
  async findByEmail(email) {
    return this.model
      .findOne({ email })
      .select("+password")
      .populate(USER_POPULATE);
  }

  // Find User By Phone
  async findByPhone(phone) {
    return this.findOne({ phone });
  }

  // Find Active Users
  async findActiveUsers() {
    return this.findAll({
      status: "ACTIVE",
    });
  }

  // Find Trade Users
  async findTradeUsers() {
    return this.findAll({
      isTradeAccount: true,
    });
  }

  // Find Users By Role
  async findByRole(roleId) {
    return this.findAll({
      roles: roleId,
    });
  }

  // Check Email Exists
  async existsByEmail(email) {
    return this.exists({
      email,
    });
  }

  // Check Phone Exists
  async existsByPhone(phone) {
    return this.exists({
      phone,
    });
  }

  // Update Last Login
  async updateLastLogin(userId) {
    return this.model.findByIdAndUpdate(
      userId,
      {
        lastLoginAt: new Date(),
      },
      {
        returnDocument: "after",
      },
    ).populate(USER_POPULATE);
  }

  // Increase Login Attempts
  async increaseLoginAttempts(userId) {
    return this.model.findByIdAndUpdate(
      userId,
      {
        $inc: {
          loginAttempts: 1,
        },
      },
      {
        returnDocument: "after",
      },
    );
  }

  // Reset Login Attempts
  async resetLoginAttempts(userId) {
    return this.model.findByIdAndUpdate(
      userId,
      {
        loginAttempts: 0,
        isLocked: false,
        lockUntil: null,
      },
      {
        returnDocument: "after",
      },
    );
  }

  // Increment Token Version
  async incrementTokenVersion(userId) {
    return this.model.findByIdAndUpdate(
      userId,
      {
        $inc: {
          tokenVersion: 1,
        },
      },
      {
        returnDocument: "after",
      },
    );
  }

  // Soft Delete User
  async softDelete(userId, deletedBy) {
    return this.model.findByIdAndUpdate(
      userId,
      {
        status: "DELETED",
        deletedAt: new Date(),
        deletedBy,
      },
      {
        returnDocument: "after",
      },
    ).populate(USER_POPULATE);
  }
}

export default new UserRepository();
