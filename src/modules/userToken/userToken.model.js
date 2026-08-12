import mongoose from "mongoose";
import { DEVICE_TYPES } from "../../shared/enums/auth.enum.js";

const userTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    refreshToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },

    deviceId: {
      type: String,
      required: true,
      index: true,
    },

    deviceName: {
      type: String,
      default: null,
    },

    deviceType: {
      type: String,
      enum: DEVICE_TYPES,
      default: "DESKTOP",
    },

    browser: {
      type: String,
      default: null,
    },

    operatingSystem: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    location: {
      type: String,
      default: null,
    },

    tokenVersion: {
      type: Number,
      default: 1,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userTokenSchema.index({
  user: 1,
  deviceId: 1,
});

userTokenSchema.index({
  expiresAt: 1,
});

userTokenSchema.index({
  isRevoked: 1,
});

const UserToken = mongoose.model("UserToken", userTokenSchema);

export default UserToken;
