import BaseService from "../../../shared/database/BaseService.js";
import relatedRepository from "./related.repository.js";
import productRepository from "../product/product.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class RelatedService extends BaseService {

    constructor() {
        super(relatedRepository);
    }

    async getByProduct(productId) {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        return await this.repository.findByProduct(productId);

    }

    async createRelated(data) {

        const product = await productRepository.findById(data.product);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        const existing = await this.repository.findByProduct(data.product);

        if (existing) {
            throw new AppError(
                "Related products entry already exists for this product.",
                409
            );
        }

        return await this.repository.create(data);

    }

    async updateRelated(productId, updateData) {

        const existing = await this.repository.findByProduct(productId);

        if (!existing) {
            throw new AppError(
                "Related products not found for this product.",
                404
            );
        }

        return await this.repository.update(existing._id, updateData);

    }

    async addRelatedItem(productId, item) {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        const targetProduct = await productRepository.findById(item.product);

        if (!targetProduct) {
            throw new AppError("Target related product not found.", 404);
        }

        if (productId === item.product) {
            throw new AppError("A product cannot be related to itself.", 400);
        }

        let existing = await this.repository.findByProduct(productId);

        if (!existing) {

            existing = await this.repository.create({
                product: productId,
                relatedProducts: [item],
            });

            return existing;

        }

        const alreadyAdded = existing.relatedProducts.some(
            (rel) => rel.product?._id?.toString() === item.product || rel.product?.toString() === item.product
        );

        if (alreadyAdded) {
            throw new AppError("Product is already in related products list.", 409);
        }

        return await this.repository.addRelatedProduct(productId, item);

    }

    async removeRelatedItem(productId, targetProductId) {

        const existing = await this.repository.findByProduct(productId);

        if (!existing) {
            throw new AppError(
                "Related products not found for this product.",
                404
            );
        }

        return await this.repository.removeRelatedProduct(productId, targetProductId);

    }

    async deleteRelated(productId, deletedBy) {

        const existing = await this.repository.findByProduct(productId);

        if (!existing) {
            throw new AppError(
                "Related products not found for this product.",
                404
            );
        }

        return await this.repository.softDelete(existing._id, {
            updatedBy: deletedBy,
        });

    }

}

export default new RelatedService();
