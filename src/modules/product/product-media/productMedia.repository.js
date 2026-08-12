import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductMedia from "./productMedia.model.js";

class ProductMediaRepository extends BaseRepository {

    constructor() {
        super(ProductMedia);
    }

// Find By Product
    async findByProduct(productId) {
        return await this.findOne({
            product: productId,
            deletedAt: null,
        });
    }

// Exists
    async existsByProduct(productId) {
        return await this.exists({
            product: productId,
            deletedAt: null,
        });
    }

}

export default new ProductMediaRepository();