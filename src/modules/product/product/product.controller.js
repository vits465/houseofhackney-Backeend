import mongoose from "mongoose";
import productService from "./product.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";
import AppError from "../../../shared/errors/AppError.js";
import { formatProduct } from "./product.formatter.js";

class ProductController {

    async create(req, res, next) {
        try {
            const product = await productService.createProduct({
                ...req.body,
                createdBy: req.user?._id,
            });

            return new ApiResponse(res, 201, "Product created successfully.", formatProduct(product)).send();
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { page, limit, category, search, status, isFeatured, isBestSeller, isNewArrival, sort } = req.query;

            const filter = { deletedAt: null };

            if (status) {
                filter.status = status;
            } else {
                // Default to PUBLISHED products for public listing unless specified
                filter.status = "PUBLISHED";
            }

            if (category) filter.category = category;
            if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true" || isFeatured === true;
            if (isBestSeller !== undefined) filter.isBestSeller = isBestSeller === "true" || isBestSeller === true;
            if (isNewArrival !== undefined) filter.isNewArrival = isNewArrival === "true" || isNewArrival === true;

            if (search) {
                const searchRegex = new RegExp(search.trim(), "i");
                filter.$or = [
                    { name: searchRegex },
                    { sku: searchRegex },
                    { searchKeywords: { $in: [searchRegex] } },
                ];
            }

            if (page || limit) {
                const paginationResult = await productService.repository.paginate(filter, {
                    page: Number(page) || 1,
                    limit: Number(limit) || 20,
                    sort: sort || { createdAt: -1 },
                });

                return new ApiResponse(res, 200, "Products fetched successfully.", {
                    ...paginationResult,
                    data: (paginationResult.data || []).map(formatProduct),
                }).send();
            }

            const products = await productService.findAll(filter);
            return new ApiResponse(res, 200, "Products fetched successfully.", (products || []).map(formatProduct)).send();
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            let product = null;

            if (mongoose.Types.ObjectId.isValid(id)) {
                product = await productService.findById(id);
            }

            if (!product) {
                product = await productService.getBySlug(id);
            }

            if (!product) {
                throw new AppError("Product not found.", 404);
            }

            return new ApiResponse(res, 200, "Product fetched successfully.", formatProduct(product)).send();
        } catch (error) {
            next(error);
        }
    }

    async getBySlug(req, res, next) {
        try {
            const product = await productService.getBySlug(req.params.slug);

            if (!product) {
                throw new AppError("Product not found.", 404);
            }

            return new ApiResponse(res, 200, "Product fetched successfully.", formatProduct(product)).send();
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const product = await productService.updateProduct(req.params.id, {
                ...req.body,
                updatedBy: req.user?._id,
            });

            return new ApiResponse(res, 200, "Product updated successfully.", formatProduct(product)).send();
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await productService.deleteProduct(req.params.id, req.user?._id);
            return new ApiResponse(res, 200, "Product deleted successfully.").send();
        } catch (error) {
            next(error);
        }
    }

}

export default new ProductController();