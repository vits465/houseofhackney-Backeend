import BaseService from "../../../shared/database/BaseService.js";

import productMediaRepository from "./productMedia.repository.js";
import productRepository from "../product/product.repository.js";

import AppError from "../../../shared/errors/AppError.js";

class ProductMediaService extends BaseService {

    constructor() {
        super(productMediaRepository);
    }

// Create
    async createMedia(data) {

        const product = await productRepository.findById(data.product);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        const exists = await this.repository.existsByProduct(data.product);

        if (exists) {
            throw new AppError(
                "Media already exists for this product.",
                409
            );
        }

        return await this.repository.create(data);
    }

// Get
    async getMedia(productId) {
        return await this.repository.findByProduct(productId);
    }

// Update
    async updateMedia(productId, updateData) {

        const media = await this.repository.findByProduct(productId);

        if (!media) {
            throw new AppError("Product media not found.", 404);
        }

        return await this.repository.update(
            media._id,
            updateData
        );
    }

// Delete
    async deleteMedia(productId, deletedBy) {

        const media = await this.repository.findByProduct(productId);

        if (!media) {
            throw new AppError("Product media not found.", 404);
        }

        return await this.repository.softDelete(
            media._id,
            {
                updatedBy: deletedBy,
            }
        );
    }

}

export default new ProductMediaService();