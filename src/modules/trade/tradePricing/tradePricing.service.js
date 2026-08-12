import BaseService from "../../../shared/database/BaseService.js";
import tradePricingRepository from "./tradePricing.repository.js";
import productRepository from "../../product/product/product.repository.js";
import tradeTierRepository from "../tradeTier/tradeTier.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class TradePricingService extends BaseService {

    constructor() {
        super(tradePricingRepository);
    }

    // Set trade pricing for a product and tier (Admin)
    async setPricing(adminId, { productId, variantId = null, tradeTierId, price, minQuantity = 1 }) {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        const tier = await tradeTierRepository.findById(tradeTierId);

        if (!tier) {
            throw new AppError("Trade tier not found.", 404);
        }

        const existing = await this.repository.findByProductAndTier(productId, tradeTierId, variantId);

        if (existing) {
            return await this.repository.update(existing._id, {
                price: Number(price),
                minQuantity: Number(minQuantity) || 1,
                updatedBy: adminId,
            });
        }

        return await this.repository.create({
            product: productId,
            variant: variantId || null,
            tradeTier: tradeTierId,
            price: Number(price),
            minQuantity: Number(minQuantity) || 1,
            createdBy: adminId,
        });
    }

    // Get trade pricings for a product
    async getPricingsByProduct(productId) {
        return await this.repository.findByProduct(productId);
    }

    // Calculate effective trade price for product based on user tier
    async getEffectiveTradePrice(productId, tierId, quantity = 1) {
        const tradePricing = await this.repository.findByProductAndTier(productId, tierId);

        if (tradePricing && quantity >= tradePricing.minQuantity) {
            return tradePricing.price;
        }

        const tier = await tradeTierRepository.findById(tierId);
        const pricing = await productRepository.findById(productId);
        const basePrice = pricing?.price || 100;

        if (tier && tier.discountPercentage > 0) {
            const discountAmount = (basePrice * tier.discountPercentage) / 100;
            return Math.max(0, basePrice - discountAmount);
        }

        return basePrice;
    }

}

export default new TradePricingService();
