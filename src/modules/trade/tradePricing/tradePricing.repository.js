import BaseRepository from "../../../shared/database/BaseRepository.js";
import TradePricing from "./tradePricing.model.js";

class TradePricingRepository extends BaseRepository {

    constructor() {
        super(TradePricing);
    }

    // Find pricing for a product and trade tier
    async findByProductAndTier(productId, tierId, variantId = null) {
        return await this.model.findOne({
            product: productId,
            variant: variantId || null,
            tradeTier: tierId,
            status: "ACTIVE",
            deletedAt: null,
        }).populate("tradeTier", "name discountPercentage creditLimit");
    }

    // Find all trade pricings for a product
    async findByProduct(productId) {
        return await this.model.find({
            product: productId,
            deletedAt: null,
        }).populate("tradeTier", "name discountPercentage");
    }

}

export default new TradePricingRepository();
