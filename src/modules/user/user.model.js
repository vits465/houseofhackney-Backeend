import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    countryCode: { type: String, default: "+91" },
    phone: { type: String, unique: true, sparse: true, trim: true },
    avatar: {
      public_id: String,
      url: String,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
      default: "PREFER_NOT_TO_SAY",
    },

    password: {
      type: String,
      select: false,
    },
    loginProvider: {
      type: String,
      enum: ["EMAIL", "GOOGLE", "APPLE", "FACEBOOK"],
      default: "EMAIL",
    },
    registrationSource: {
      type: String,
      enum: ["WEB", "ADMIN", "GOOGLE", "APPLE", "FACEBOOK", "IMPORT"],
      default: "WEB",
    },
    passwordChangedAt: Date,
    lastLoginAt: Date,
    lastSeenAt: Date,
    tokenVersion: {
      type: Number,
      default: 1,
    },

    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],

    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: Date,
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: Date,

    accountType: {
      type: String,
      enum: ["PERSONAL", "BUSINESS"],
      default: "PERSONAL",
    },

    isTradeAccount: {
      type: Boolean,
      default: false,
    },

    tradeProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradeProfile",
      default: null,
    },

    language: { type: String, default: "en" },
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },

    loginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lockUntil: Date,
    twoFactorEnabled: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED", "SUSPENDED", "DELETED"],
      default: "ACTIVE",
    },

    deletedAt: Date,

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.index({ status: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ isTradeAccount: 1 });
userSchema.index({ registrationSource: 1 });
userSchema.index({ accountType: 1 });

userSchema.pre("save", async function () {
  this.displayName = `${this.firstName} ${this.lastName}`.trim();

  if (!this.isModified("password") || !this.password) {
    return;
  }

  // If password is already a valid bcrypt hash, do not hash it again
  if (/^\$2[aby]\$\d{2}\$/.test(this.password)) {
    return;
  }

  if (!this.isNew) {
    this.tokenVersion = (this.tokenVersion || 1) + 1;
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;

  // If stored password is plain text (e.g. from direct DB update), match & auto-upgrade to bcrypt hash
  if (!/^\$2[aby]\$\d{2}\$/.test(this.password)) {
    const isMatch = candidatePassword === this.password;
    if (isMatch) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      this.password = await bcrypt.hash(candidatePassword, salt);
      await this.save();
    }
    return isMatch;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.__v;

  return user;
};

userSchema.query.active = function () {
    return this.where({
        status: "ACTIVE",
        deletedAt: null,
    });
};

userSchema.virtual("displayName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model("User", userSchema);

export default User;
