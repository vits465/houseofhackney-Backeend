import BaseRepository from "../../../shared/database/BaseRepository.js";
import Brand from "./brand.model.js";

class BrandRepository extends BaseRepository {

    constructor() {
        super(Brand);
    }

// Find By Slug
    async findBySlug(slug) {

        return await this.findOne({
            slug,
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

// Find Featured Brands
    async findFeaturedBrands() {

        return await this.findActive({
            isFeatured: true,
        });

    }

}

export default new BrandRepository();