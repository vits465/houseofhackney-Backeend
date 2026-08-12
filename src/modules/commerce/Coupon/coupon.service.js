import BaseService from "../../../shared/database/BaseService.js";
import couponRepository from "./coupon.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class CouponService extends BaseService {

    constructor() {
        super(couponRepository);
    }

    // Create a new coupon
    async createCoupon(couponData, adminId) {
        const existing = await this.repository.findByCode(couponData.code);

        if (existing) {
            throw new AppError("Coupon code already exists.", 409);
        }

        couponData.code = couponData.code.trim().toUpperCase();
        couponData.createdBy = adminId;

        return await this.repository.create(couponData);
    }

    // Get all coupons with optional status filter
    async getCoupons(filter = {}) {
        return await this.repository.findAll({
            ...filter,
            deletedAt: null,
        });
    }

    // Get single coupon details
    async getCouponById(couponId) {
        const coupon = await this.repository.findOne({
            _id: couponId,
            deletedAt: null,
        });

        if (!coupon) {
            throw new AppError("Coupon not found.", 404);
        }

        return coupon;
    }

    // Update coupon details
    async updateCoupon(couponId, updateData, adminId) {
        await this.getCouponById(couponId);

        if (updateData.code) {
            updateData.code = updateData.code.trim().toUpperCase();
        }

        updateData.updatedBy = adminId;

        return await this.repository.update(couponId, updateData);
    }

    // Delete coupon (soft delete)
    async deleteCoupon(couponId) {
        await this.getCouponById(couponId);

        return await this.repository.softDelete(couponId);
    }

    // Validate coupon code and calculate discount amount
    async validateAndApply(code, user, subtotal) {
        const coupon = await this.repository.findByCode(code);

        if (!coupon || coupon.status !== "ACTIVE") {
            throw new AppError("Invalid or inactive coupon code.", 400);
        }

        const now = new Date();

        if (new Date(coupon.startDate) > now) {
            throw new AppError("Coupon is not active yet.", 400);
        }

        if (new Date(coupon.expiryDate) <= now) {
            throw new AppError("Coupon has expired.", 400);
        }

        // Check system total usage limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            throw new AppError("Coupon total usage limit has been reached.", 400);
        }

        // Check minimum order amount requirement
        if (subtotal < coupon.minOrderAmount) {
            throw new AppError(
                `Minimum order subtotal of ${coupon.minOrderAmount} required for this coupon.`,
                400
            );
        }

        // Check user targeted coupon rule
        if (coupon.couponTarget === "USER" && coupon.applicableUsers.length > 0) {
            const isTargetUser = coupon.applicableUsers.some(
                (uId) => uId.toString() === user._id.toString()
            );

            if (!isTargetUser) {
                throw new AppError("This coupon is not valid for your account.", 400);
            }
        }

        // Calculate discount amount
        let calculatedDiscount = 0;

        if (coupon.discountType === "PERCENTAGE") {
            calculatedDiscount = (subtotal * coupon.discountValue) / 100;

            if (coupon.maxDiscountAmount !== null) {
                calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscountAmount);
            }
        } else if (coupon.discountType === "FLAT") {
            calculatedDiscount = coupon.discountValue;
        }

        // Clamp discount to subtotal
        const finalDiscount = Math.min(subtotal, Math.round(calculatedDiscount * 100) / 100);

        return {
            coupon,
            discountAmount: finalDiscount,
        };
    }

}

export default new CouponService();
