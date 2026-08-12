import BaseService from "../../../shared/database/BaseService.js";
import brandRepository from "./brand.repository.js";

import AppError from "../../../shared/errors/AppError.js";
import slugify from "../../../shared/helpers/slugify.js";

class BrandService extends BaseService {

    constructor() {
        super(brandRepository);
    }

// Create Brand
    async createBrand(brandData) {

        brandData.slug = slugify(brandData.name);

        const exists = await this.repository.existsBySlug(
            brandData.slug
        );

        if (exists) {
            throw new AppError(
                "Brand already exists.",
                409
            );
        }

        return await this.repository.create(brandData);

    }

// Update Brand
    async updateBrand(id, updateData) {

        const brand = await this.findById(id);

        if (!brand) {
            throw new AppError(
                "Brand not found.",
                404
            );
        }

        if (updateData.name) {

            updateData.slug = slugify(updateData.name);

            const exists =
                await this.repository.findBySlug(
                    updateData.slug
                );

            if (
                exists &&
                exists._id.toString() !== id
            ) {

                throw new AppError(
                    "Brand already exists.",
                    409
                );

            }

        }

        return await this.update(id, updateData);

    }

// Delete Brand
    async deleteBrand(id, deletedBy) {

        const brand = await this.findById(id);

        if (!brand) {

            throw new AppError(
                "Brand not found.",
                404
            );

        }

        return await this.softDelete(id, {
            updatedBy: deletedBy,
        });

    }

// Get Featured
    async getFeaturedBrands() {

        return await this.repository.findFeaturedBrands();

    }

}

export default new BrandService();