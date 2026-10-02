import BaseRepository from "../../../shared/database/BaseRepository.js";
import Variant from "./variant.model.js";
import { VARIANT_POPULATE } from "../../../shared/populate/product_sub.populate.js";

class VariantRepository extends BaseRepository {

    constructor() {
        super(Variant, VARIANT_POPULATE);
    }

    async findByProduct(productId) {
        return await this.findAll({
            product: productId,
            deletedAt: null,
        });
    }

    async existsBySlug(slug) {
        return await this.exists({
            slug,
            deletedAt: null,
        });
    }

    async existsBySku(sku) {
        return await this.exists({
            sku,
            deletedAt: null,
        });
    }

}

export default new VariantRepository();
