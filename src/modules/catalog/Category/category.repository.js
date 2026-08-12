import BaseRepository from "../../../shared/database/BaseRepository.js";
import Category from "./category.model.js";

class CategoryRepository extends BaseRepository {

    constructor() {
        super(Category);
    }

// Find By Slug
    async findBySlug(slug) {

        return this.model.findOne({
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

        return this.model.find({
            parentCategory: null,
            deletedAt: null,
            status: "ACTIVE",
        });

    }

// Find Child Categories
    async findChildren(parentCategory) {

        return this.model.find({
            parentCategory,
            deletedAt: null,
            status: "ACTIVE",
        });

    }

// Find Menu Categories
    async findMenuCategories() {

        return this.model.find({
            showInMenu: true,
            deletedAt: null,
            status: "ACTIVE",
        }).sort({
            sortOrder: 1,
            name: 1,
        });

    }

// Find Featured Categories
    async findFeaturedCategories() {

        return this.model.find({
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
        );

    }

}

export default new CategoryRepository();