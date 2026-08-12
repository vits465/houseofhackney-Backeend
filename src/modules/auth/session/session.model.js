import mongoose from "mongoose";
import { DEVICE_TYPES } from "../../../shared/enums/auth.enum.js";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
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
      index: { expires: 0 },
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
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
  }
);

sessionSchema.index({ user: 1, deviceId: 1 });
sessionSchema.index({ user: 1, isRevoked: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
