import BaseRepository from "../../../shared/database/BaseRepository.js";
import Coupon from "./coupon.model.js";
import { COUPON_POPULATE } from "../../../shared/populate/commerce.populate.js";

class CouponRepository extends BaseRepository {

    constructor() {
        super(Coupon, COUPON_POPULATE);
    }

    // Find active coupon by code
    async findByCode(code) {
        return await this.findOne({
            code: code.trim().toUpperCase(),
            deletedAt: null,
        });
    }

    // Find all active non-expired coupons
    async findActive() {
        const now = new Date();

        return await this.findAll({
            status: "ACTIVE",
            deletedAt: null,
            startDate: { $lte: now },
            expiryDate: { $gt: now },
        });
    }

    // Increment coupon total usage count
    async incrementUsage(couponId) {
        return await this.model.findByIdAndUpdate(
            couponId,
            { $inc: { usedCount: 1 } },
            { new: true }
        ).populate(COUPON_POPULATE);
    }

}

export default new CouponRepository();
