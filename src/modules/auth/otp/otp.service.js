import crypto from "crypto";
import Otp from "./otp.model.js";
import emailService from "./email.service.js";
import AppError from "../../../shared/errors/AppError.js";

class OtpService {
  #hashOtp(otp) {
    return crypto.createHash("sha256").update(otp.toString()).digest("hex");
  }

  async generateAndSendOtp({ email, purpose, name = "Customer" }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check resend cooldown (60 seconds)
    const existingOtp = await Otp.findOne({
      email: normalizedEmail,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (existingOtp) {
      const timeDiffSeconds = Math.floor(
        (Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000
      );
      if (timeDiffSeconds < 60) {
        const remaining = 60 - timeDiffSeconds;
        throw new AppError(
          `Please wait ${remaining} seconds before requesting a new OTP.`,
          429
        );
      }

      // Mark older OTPs as used / invalidated
      await Otp.updateMany(
        { email: normalizedEmail, purpose, isUsed: false },
        { isUsed: true }
      );
    }

    // Generate 6 digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = this.#hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await Otp.create({
      email: normalizedEmail,
      otpHash,
      purpose,
      expiresAt,
      lastSentAt: new Date(),
    });

    // Send OTP Email using EJS Template
    await emailService.sendOtpEmail({
      to: normalizedEmail,
      name,
      otp: rawOtp,
      purpose,
    });

    return {
      message: "OTP sent successfully.",
      expiresInMinutes: 10,
    };
  }

  async verifyOtp({ email, purpose, otp }) {
    const normalizedEmail = email.toLowerCase().trim();
    const otpHash = this.#hashOtp(otp);

    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      throw new AppError("Invalid or expired OTP.", 400);
    }

    if (otpDoc.attempts >= 5) {
      otpDoc.isUsed = true;
      await otpDoc.save();
      throw new AppError("Too many failed attempts. Please request a new OTP.", 429);
    }

    if (otpDoc.otpHash !== otpHash) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      throw new AppError("Invalid OTP code.", 400);
    }

    // Mark as used
    otpDoc.isUsed = true;
    await otpDoc.save();

    return true;
  }
}

export default new OtpService();
