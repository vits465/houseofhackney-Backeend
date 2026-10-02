import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductSEO from "./seo.model.js";
import { SEO_POPULATE } from "../../../shared/populate/product_sub.populate.js";

class SeoRepository extends BaseRepository {

    constructor() {
        super(ProductSEO, SEO_POPULATE);
    }

// Find By Product
    async findByProduct(productId) {

        return await this.findOne({
            product: productId,
            deletedAt: null,
        });

    }

// Exists By Product
    async existsByProduct(productId) {

        return await this.exists({
            product: productId,
            deletedAt: null,
        });

    }

}

export default new SeoRepository();