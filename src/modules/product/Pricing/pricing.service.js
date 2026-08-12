import BaseService from "../../../shared/database/BaseService.js";
import pricingRepository from "./pricing.repository.js";

import productRepository from "../product/product.repository.js";

import AppError from "../../../shared/errors/AppError.js";

class PricingService extends BaseService {

    constructor() {
        super(pricingRepository);
    }

// Create Pricing
    async createPricing(pricingData) {

        const product = await productRepository.findById(
            pricingData.product
        );

        if (!product) {
            throw new AppError(
                "Product not found.",
                404
            );
        }

        const exists =
            await this.repository.existsByProduct(
                pricingData.product
            );

        if (exists) {
            throw new AppError(
                "Pricing already exists for this product.",
                409
            );
        }

        return await this.repository.create(pricingData);

    }

// Update Pricing
    async updatePricing(productId, updateData) {

        const pricing =
            await this.repository.findByProduct(productId);

        if (!pricing) {
            throw new AppError(
                "Pricing not found.",
                404
            );
        }

        return await this.repository.update(
            pricing._id,
            updateData
        );

    }

// Delete Pricing
    async deletePricing(productId, deletedBy) {

        const pricing =
            await this.repository.findByProduct(productId);

        if (!pricing) {
            throw new AppError(
                "Pricing not found.",
                404
            );
        }

        return await this.repository.softDelete(
            pricing._id,
            {
                updatedBy: deletedBy,
            }
        );

    }

// Get Product Pricing
    async getPricing(productId) {

        return await this.repository.findByProduct(
            productId
        );

    }

}

export default new PricingService();