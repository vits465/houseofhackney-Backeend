import BaseRepository from "../../../shared/database/BaseRepository.js";
import Coupon from "./coupon.model.js";

class CouponRepository extends BaseRepository {

    constructor() {
        super(Coupon);
    }

    // Find active coupon by code
    async findByCode(code) {
        return await this.model.findOne({
            code: code.trim().toUpperCase(),
            deletedAt: null,
        });
    }

    // Find all active non-expired coupons
    async findActive() {
        const now = new Date();

        return await this.model.find({
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
        );
    }

}

export default new CouponRepository();
