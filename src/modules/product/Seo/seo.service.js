import BaseService from "../../../shared/database/BaseService.js";

import seoRepository from "./seo.repository.js";
import productRepository from "../product/product.repository.js";

import AppError from "../../../shared/errors/AppError.js";

class SeoService extends BaseService {

    constructor() {
        super(seoRepository);
    }

// Create SEO
    async createSEO(seoData) {

        const product = await productRepository.findById(
            seoData.product
        );

        if (!product) {
            throw new AppError(
                "Product not found.",
                404
            );
        }

        const exists =
            await this.repository.existsByProduct(
                seoData.product
            );

        if (exists) {
            throw new AppError(
                "SEO already exists for this product.",
                409
            );
        }

        return await this.repository.create(seoData);

    }

// Get SEO
    async getSEO(productId) {

        return await this.repository.findByProduct(
            productId
        );

    }

// Update SEO
    async updateSEO(productId, updateData) {

        const seo =
            await this.repository.findByProduct(
                productId
            );

        if (!seo) {
            throw new AppError(
                "SEO not found.",
                404
            );
        }

        return await this.repository.update(
            seo._id,
            updateData
        );

    }

// Delete SEO
    async deleteSEO(productId, deletedBy) {

        const seo =
            await this.repository.findByProduct(
                productId
            );

        if (!seo) {
            throw new AppError(
                "SEO not found.",
                404
            );
        }

        return await this.repository.softDelete(
            seo._id,
            {
                updatedBy: deletedBy,
            }
        );

    }

}

export default new SeoService();