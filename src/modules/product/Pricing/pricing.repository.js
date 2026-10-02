import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductPricing from "./pricing.model.js";
import { PRICING_POPULATE } from "../../../shared/populate/product_sub.populate.js";

class PricingRepository extends BaseRepository {

    constructor() {
        super(ProductPricing, PRICING_POPULATE);
    }

// Find By Product
    async findByProduct(productId) {

        return await this.findOne({
            product: productId,
            deletedAt: null,
        });

    }

// Check Pricing Exists
    async existsByProduct(productId) {

        return await this.exists({
            product: productId,
            deletedAt: null,
        });

    }

}

export default new PricingRepository();