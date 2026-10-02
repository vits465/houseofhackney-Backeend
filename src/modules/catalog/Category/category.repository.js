import BaseRepository from "../../../shared/database/BaseRepository.js";
import Category from "./category.model.js";
import { CATEGORY_POPULATE } from "../../../shared/populate/catalog.populate.js";

class CategoryRepository extends BaseRepository {

    constructor() {
        super(Category, CATEGORY_POPULATE);
    }

// Find By Slug
    async findBySlug(slug) {

        return this.findOne({
            slug,
            deletedAt: null,
        });

    }

// Check Slug Exists
    async existsBySlug(slug) {

        return this.exists({
            slug,
            deletedAt: null,
        });

    }

// Find Root Categories
    async findRootCategories() {

        return this.findAll({
            parentCategory: null,
            deletedAt: null,
            status: "ACTIVE",
        });

    }

// Find Child Categories
    async findChildren(parentCategory) {

        return this.findAll({
            parentCategory,
            deletedAt: null,
            status: "ACTIVE",
        });

    }

// Find Menu Categories
    async findMenuCategories() {

        return this.findAll({
            showInMenu: true,
            deletedAt: null,
            status: "ACTIVE",
        }, null, {
            sort: {
                sortOrder: 1,
                name: 1,
            },
        });

    }

// Find Featured Categories
    async findFeaturedCategories() {

        return this.findAll({
            isFeatured: true,
            deletedAt: null,
            status: "ACTIVE",
        });

    }

// Soft Delete
    async softDelete(categoryId, deletedBy) {

        return this.model.findByIdAndUpdate(
            categoryId,
            {
                deletedAt: new Date(),
                updatedBy: deletedBy,
            },
            {
                new: true,
            }
        ).populate(CATEGORY_POPULATE);

    }

}

export default new CategoryRepository();