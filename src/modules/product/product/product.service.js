import BaseService from "../../../shared/database/BaseService.js";
import productRepository from "./product.repository.js";

import AppError from "../../../shared/errors/AppError.js";
import slugify from "../../../shared/helpers/slugify.js";

class ProductService extends BaseService {

    constructor() {
        super(productRepository);
    }

// Create Product
    async createProduct(productData) {

        productData.slug = slugify(productData.name);

        const slugExists = await this.repository.existsBySlug(
            productData.slug
        );

        if (slugExists) {
            throw new AppError(
                "Product slug already exists.",
                409
            );
        }

        const skuExists = await this.repository.existsBySku(
            productData.sku
        );

        if (skuExists) {
            throw new AppError(
                "SKU already exists.",
                409
            );
        }

        return await this.repository.create(productData);

    }

// Update Product
    async updateProduct(productId, updateData) {

        const product = await this.findById(productId);

        if (!product) {
            throw new AppError(
                "Product not found.",
                404
            );
        }

        if (updateData.name) {

            updateData.slug = slugify(updateData.name);

            const existing = await this.repository.findBySlug(
                updateData.slug
            );

            if (
                existing &&
                existing._id.toString() !== productId
            ) {
                throw new AppError(
                    "Product slug already exists.",
                    409
                );
            }

        }

        return await this.update(productId, updateData);

    }

// Delete Product
    async deleteProduct(productId, deletedBy) {

        const product = await this.findById(productId);

        if (!product) {
            throw new AppError(
                "Product not found.",
                404
            );
        }

        return await this.softDelete(productId, {
            updatedBy: deletedBy,
        });

    }

// Featured Products
    async getFeaturedProducts() {

        return await this.repository.findFeaturedProducts();

    }

// Best Sellers
    async getBestSellers() {

        return await this.repository.findBestSellers();

    }

// New Arrivals
    async getNewArrivals() {

        return await this.repository.findNewArrivals();

    }

}

export default new ProductService();