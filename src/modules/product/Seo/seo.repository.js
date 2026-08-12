import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductSEO from "./seo.model.js";

class SeoRepository extends BaseRepository {

    constructor() {
        super(ProductSEO);
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