import BaseService from "../../../shared/database/BaseService.js";

import variantRepository from "./variant.repository.js";
import productRepository from "../product/product.repository.js";

import generateSlug from "../../../shared/helpers/slugify.js";
import counterService from "../../counter/counter.service.js";

import AppError from "../../../shared/errors/AppError.js";

class VariantService extends BaseService {

    constructor() {
        super(variantRepository);
    }

// Create Variant
    async createVariant(data) {

        const product = await productRepository.findById(
            data.product
        );

        if (!product) {
            throw new AppError(
                "Product not found.",
                404
            );
        }

        data.slug = generateSlug(data.name);

        const slugExists =
            await this.repository.existsBySlug(
                data.slug
            );

        if (slugExists) {
            throw new AppError(
                "Variant slug already exists.",
                409
            );
        }

        if (!data.sku) {

            data.sku =
                await counterService.generateSku(
                    "VARIANT"
                );

        }

        const skuExists =
            await this.repository.existsBySku(
                data.sku
            );

        if (skuExists) {
            throw new AppError(
                "Variant SKU already exists.",
                409
            );
        }

        if (data.isDefault) {

            await this.repository.updateOne(
                {
                    product: data.product,
                    isDefault: true,
                },
                {
                    isDefault: false,
                }
            );

        }

        return await this.repository.create(data);

    }

// Get Variants
    async getVariants(productId) {

        return await this.repository.findByProduct(
            productId
        );

    }

// Update Variant
    async updateVariant(id, updateData) {

        const variant =
            await this.repository.findById(id);

        if (!variant) {
            throw new AppError(
                "Variant not found.",
                404
            );
        }

        if (updateData.isDefault) {

            await this.repository.updateOne(
                {
                    product: variant.product,
                    isDefault: true,
                },
                {
                    isDefault: false,
                }
            );

        }

        return await this.repository.update(
            id,
            updateData
        );

    }

// Delete Variant
    async deleteVariant(id, deletedBy) {

        return await this.repository.softDelete(
            id,
            {
                updatedBy: deletedBy,
            }
        );

    }

}

export default new VariantService();