import BaseRepository from "../../../shared/database/BaseRepository.js";
import TradePricing from "./tradePricing.model.js";
import { TRADE_PRICING_POPULATE } from "../../../shared/populate/trade.populate.js";

class TradePricingRepository extends BaseRepository {

    constructor() {
        super(TradePricing, TRADE_PRICING_POPULATE);
    }

    // Find pricing for a product and trade tier
    async findByProductAndTier(productId, tierId, variantId = null) {
        return await this.findOne({
            product: productId,
            variant: variantId || null,
            tradeTier: tierId,
            status: "ACTIVE",
            deletedAt: null,
        });
    }

    // Find all trade pricings for a product
    async findByProduct(productId) {
        return await this.findAll({
            product: productId,
            deletedAt: null,
        });
    }

}

export default new TradePricingRepository();
