import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductMedia from "./productMedia.model.js";
import { PRODUCT_MEDIA_POPULATE } from "../../../shared/populate/product_sub.populate.js";

class ProductMediaRepository extends BaseRepository {

    constructor() {
        super(ProductMedia, PRODUCT_MEDIA_POPULATE);
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