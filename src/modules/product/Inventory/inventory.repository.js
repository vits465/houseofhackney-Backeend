import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductInventory from "./inventory.model.js";
import { INVENTORY_POPULATE } from "../../../shared/populate/product_sub.populate.js";

class InventoryRepository extends BaseRepository {

    constructor() {
        super(ProductInventory, INVENTORY_POPULATE);
    }

    async findByProduct(productId) {
        return await this.findOne({
            product: productId,
            deletedAt: null,
        });
    }

    async existsByProduct(productId) {
        return await this.exists({
            product: productId,
            deletedAt: null,
        });
    }

}

export default new InventoryRepository();