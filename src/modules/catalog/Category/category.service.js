import BaseService from "../../../shared/database/BaseService.js";
import categoryRepository from "./category.repository.js";

import AppError from "../../../shared/errors/AppError.js";
import slugify from "../../../shared/helpers/slugify.js";

class CategoryService extends BaseService {

    constructor() {
        super(categoryRepository);
    }

// Create Category
    async createCategory(categoryData) {

        // Generate Slug
        categoryData.slug = slugify(categoryData.name);

        // Check Slug Exists
    const
    slugExists = await this.repository.existsBySlug(
            categoryData.slug
        );

        if (slugExists) {
            throw new AppError(
                "Category already exists.",
                409
            );
        }

        // Root Category
    if (!categoryData.parentCategory) {

            categoryData.level = 1;
            categoryData.path = categoryData.slug;

        }

        // Child Category
        else {

            const parent = await this.repository.findById(
                categoryData.parentCategory
            );

            if (!parent) {
                throw new AppError(
                    "Parent category not found.",
                    404
                );
            }

            if (parent.status !== "ACTIVE") {
                throw new AppError(
                    "Parent category is inactive.",
                    400
                );
            }

            categoryData.level = parent.level + 1;
            categoryData.path = `${parent.path}/${categoryData.slug}`;

        }

        return await this.repository.create(categoryData);

    }

// Update Category
    async updateCategory(categoryId, updateData) {

        const category = await this.repository.findById(categoryId);

        if (!category) {
            throw new AppError(
                "Category not found.",
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
                existing._id.toString() !== categoryId
            ) {
                throw new AppError(
                    "Category already exists.",
                    409
                );
            }

            // Update Path
    if (!category.parentCategory) {

                updateData.path = updateData.slug;

            } else {

                const parent = await this.repository.findById(
                    category.parentCategory
                );

                updateData.path = `${parent.path}/${updateData.slug}`;

            }

        }

        return await this.repository.update(
            categoryId,
            updateData
        );

    }

// Delete Category
    async deleteCategory(categoryId, deletedBy) {

        const category = await this.repository.findById(
            categoryId
        );

        if (!category) {
            throw new AppError(
                "Category not found.",
                404
            );
        }

        const children = await this.repository.findChildren(
            categoryId
        );

        if (children.length > 0) {

            throw new AppError(
                "Cannot delete category with child categories.",
                400
            );

        }

        return await this.repository.softDelete(
            categoryId,
            deletedBy
        );

    }

// Find Category By Slug
    async findBySlug(slug) {

        return await this.repository.findBySlug(slug);

    }

// Get Root Categories
    async getRootCategories() {

        return await this.repository.findRootCategories();

    }

// Get Menu Categories
    async getMenu() {

        return await this.repository.findMenuCategories();

    }

// Get Featured Categories
    async getFeatured() {

        return await this.repository.findFeaturedCategories();

    }

// Get Category Tree
    async getCategoryTree(parentCategory = null) {

        return await this.repository.find({
            parentCategory,
            deletedAt: null,
            status: "ACTIVE",
        });

    }

}

export default new CategoryService();