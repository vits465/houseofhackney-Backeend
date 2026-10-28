import mongoose from "mongoose";
import productService from "./product.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";
import AppError from "../../../shared/errors/AppError.js";
import { formatProduct } from "./product.formatter.js";
import { PRODUCT_LIST_POPULATE } from "../../../shared/populate/product.populate.js";
import Category from "../../catalog/Category/category.model.js";

class ProductController {

    async create(req, res, next) {
        try {
            const product = await productService.createProduct({
                ...req.body,
                createdBy: req.user?._id,
            });

            return new ApiResponse(res, 201, "Product created successfully.", formatProduct(product, req.user)).send();
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const {
                page,
                limit,
                category,
                collection,
                productType,
                type,
                colour,
                color,
                material,
                style,
                search,
                status,
                visibility,
                isFeatured,
                isBestSeller,
                isNewArrival,
                sort,
            } = req.query;

            const filter = { deletedAt: null };

            // Visibility & Status security
            const isAdminOrStaff = req.user && (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN" || req.user.role === "STAFF");

            if (status) {
                if (!isAdminOrStaff && status !== "PUBLISHED") {
                    filter.status = "PUBLISHED";
                } else {
                    filter.status = status;
                }
            } else {
                filter.status = "PUBLISHED";
            }

            if (!isAdminOrStaff) {
                filter.visibility = { $ne: "PRIVATE" };
            } else if (visibility) {
                filter.visibility = visibility;
            }

            // Category filter (supports ObjectId or slug)
            if (category) {
                if (mongoose.Types.ObjectId.isValid(category)) {
                    filter.category = category;
                } else {
                    const foundCat = await Category.findOne({ slug: category, deletedAt: null }).select("_id").lean();
                    if (foundCat) {
                        filter.category = foundCat._id;
                    } else {
                        // Return empty if category slug not found
                        filter.category = new mongoose.Types.ObjectId();
                    }
                }
            }

            // Product Type filter
            const pType = productType || type;
            if (pType && typeof pType === "string") {
                filter.productType = pType.trim().toUpperCase();
            }

            // Collection filter
            if (collection) {
                if (mongoose.Types.ObjectId.isValid(collection)) {
                    filter.collection = collection;
                }
            }

            // Material filter
            if (material && mongoose.Types.ObjectId.isValid(material)) {
                filter.material = material;
            }

            // Colour filter
            const cFilter = colour || color;
            if (cFilter && mongoose.Types.ObjectId.isValid(cFilter)) {
                filter.colours = cFilter;
            }

            // Style filter
            if (style && mongoose.Types.ObjectId.isValid(style)) {
                filter.styles = style;
            }

            // Flags
            if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true" || isFeatured === true;
            if (isBestSeller !== undefined) filter.isBestSeller = isBestSeller === "true" || isBestSeller === true;
            if (isNewArrival !== undefined) filter.isNewArrival = isNewArrival === "true" || isNewArrival === true;

            // Search by name, SKU, or searchKeywords
            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), "i");
                filter.$or = [
                    { name: searchRegex },
                    { sku: searchRegex },
                    { searchKeywords: { $in: [searchRegex] } },
                ];
            }

            // Sorting options
            let sortOption = { createdAt: -1 };
            if (sort) {
                const s = sort.toString().toLowerCase();
                if (s === "newest" || s === "new") {
                    sortOption = { createdAt: -1 };
                } else if (s === "oldest") {
                    sortOption = { createdAt: 1 };
                } else if (s === "featured") {
                    sortOption = { isFeatured: -1, createdAt: -1 };
                } else if (s === "bestseller" || s === "best-selling") {
                    sortOption = { isBestSeller: -1, createdAt: -1 };
                } else if (s === "name_asc" || s === "a-z") {
                    sortOption = { name: 1 };
                } else if (s === "name_desc" || s === "z-a") {
                    sortOption = { name: -1 };
                }
            }

            const pageNum = Math.max(1, Number(page) || 1);
            const limitNum = Math.min(500, Math.max(1, Number(limit) || 20));

            const paginationResult = await productService.repository.paginate(filter, {
                page: pageNum,
                limit: limitNum,
                sort: sortOption,
                populate: PRODUCT_LIST_POPULATE,
                lean: true,
            });

            // Fast Vercel Edge caching for guest shoppers, real-time for authenticated users
            if (!req.user) {
                res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
            } else {
                res.setHeader("Cache-Control", "no-store");
            }

            const formattedProducts = (paginationResult.data || []).map((p) => formatProduct(p, req.user));

            return res.status(200).json({
                success: true,
                message: "Products fetched successfully.",
                data: formattedProducts,
                pagination: {
                    page: paginationResult.page,
                    limit: paginationResult.limit,
                    total: paginationResult.total,
                    totalPages: paginationResult.totalPages,
                },
                errors: null,
            });
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

            if (!product || product.deletedAt) {
                throw new AppError("Product not found.", 404);
            }

            const isAdminOrStaff = req.user && (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN" || req.user.role === "STAFF");

            // Exclude unpublished or private products from public storefront
            if (!isAdminOrStaff) {
                if (product.status !== "PUBLISHED" || product.visibility === "PRIVATE") {
                    throw new AppError("Product not found.", 404);
                }
            }

            return new ApiResponse(res, 200, "Product fetched successfully.", formatProduct(product, req.user)).send();
        } catch (error) {
            next(error);
        }
    }

    async getBySlug(req, res, next) {
        try {
            const product = await productService.getBySlug(req.params.slug);

            if (!product || product.deletedAt) {
                throw new AppError("Product not found.", 404);
            }

            const isAdminOrStaff = req.user && (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN" || req.user.role === "STAFF");

            if (!isAdminOrStaff) {
                if (product.status !== "PUBLISHED" || product.visibility === "PRIVATE") {
                    throw new AppError("Product not found.", 404);
                }
            }

            return new ApiResponse(res, 200, "Product fetched successfully.", formatProduct(product, req.user)).send();
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

            return new ApiResponse(res, 200, "Product updated successfully.", formatProduct(product, req.user)).send();
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