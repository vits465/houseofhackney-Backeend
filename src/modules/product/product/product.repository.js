import BaseRepository from "../../../shared/database/BaseRepository.js";
import Product from "./product.model.js";

class ProductRepository extends BaseRepository {

    constructor() {
        super(Product);
    }

// Find By Slug
    async findBySlug(slug) {

        return await this.findOne({
            slug,
            deletedAt: null,
        });

    }

// Find By SKU
    async findBySku(sku) {

        return await this.findOne({
            sku,
            deletedAt: null,
        });

    }

// Check Slug Exists
    async existsBySlug(slug) {

        return await this.exists({
            slug,
            deletedAt: null,
        });

    }

// Check SKU Exists
    async existsBySku(sku) {

        return await this.exists({
            sku,
            deletedAt: null,
        });

    }

// Featured Products
    async findFeaturedProducts() {

        return await this.findActive({
            isFeatured: true,
        });

    }

// Best Sellers
    async findBestSellers() {

        return await this.findActive({
            isBestSeller: true,
        });

    }

// New Arrivals
    async findNewArrivals() {

        return await this.findActive({
            isNewArrival: true,
        });

    }

}

export default new ProductRepository();