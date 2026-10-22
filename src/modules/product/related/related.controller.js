import relatedService from "./related.service.js";
import productService from "../product/product.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";
import AppError from "../../../shared/errors/AppError.js";
import { formatProduct } from "../product/product.formatter.js";

class RelatedController {

    async get(req, res, next) {
        try {
            const { productId } = req.params;

            const product = (await productService.findById(productId)) || (await productService.getBySlug(productId));
            if (!product || product.deletedAt) {
                throw new AppError("Product not found.", 404);
            }

            const relatedData = await relatedService.getByProduct(product._id);
            let rawItems = [];

            if (relatedData?.relatedProducts?.length) {
                rawItems = relatedData.relatedProducts
                    .map((r) => r.product)
                    .filter((p) => p && p.status === "PUBLISHED" && !p.deletedAt && p._id?.toString() !== product._id.toString());
            }

            // Fallback dynamically if explicit relations are fewer than 4
            if (rawItems.length < 4) {
                const query = {
                    _id: { $ne: product._id },
                    status: "PUBLISHED",
                    visibility: { $ne: "PRIVATE" },
                    deletedAt: null,
                };

                if (product.collection) {
                    query.collection = product.collection;
                } else if (product.category) {
                    query.category = product.category;
                } else {
                    query.productType = product.productType;
                }

                const dynamicProducts = await productService.repository.model
                    .find(query)
                    .limit(8)
                    .populate("pricing")
                    .lean();

                const existingIds = new Set(rawItems.map((p) => p._id?.toString()));
                for (const dp of dynamicProducts) {
                    if (!existingIds.has(dp._id?.toString())) {
                        existingIds.add(dp._id?.toString());
                        rawItems.push(dp);
                    }
                }
            }

            // Format into essential storefront card fields
            const formatted = rawItems.slice(0, 8).map((item) => {
                const fp = formatProduct(item, req.user);
                return {
                    _id: fp._id,
                    id: fp._id,
                    name: fp.name,
                    slug: fp.slug,
                    thumbnail: fp.thumbnail,
                    productType: fp.productType,
                    price: fp.pricing?.sellingPrice ?? 0,
                    sellingPrice: fp.pricing?.sellingPrice ?? 0,
                    compareAtPrice: fp.pricing?.compareAtPrice ?? 0,
                    currency: fp.pricing?.currency ?? "GBP",
                    priceUnit: fp.pricing?.priceUnit ?? "item",
                    sample: fp.pricing?.sample || null,
                };
            });

            return new ApiResponse(
                res,
                200,
                "Product related items fetched successfully.",
                formatted
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const productId = req.params.productId || req.body.product;

            const related = await relatedService.createRelated({
                ...req.body,
                product: productId,
                createdBy: req.user?._id,
            });

            return new ApiResponse(
                res,
                201,
                "Product related items created successfully.",
                related
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const productId = req.params.productId;

            const related = await relatedService.updateRelated(
                productId,
                {
                    ...req.body,
                    updatedBy: req.user?._id,
                }
            );

            return new ApiResponse(
                res,
                200,
                "Product related items updated successfully.",
                related
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async addItem(req, res, next) {
        try {
            const productId = req.params.productId;

            const related = await relatedService.addRelatedItem(
                productId,
                req.body
            );

            return new ApiResponse(
                res,
                200,
                "Related item added successfully.",
                related
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async removeItem(req, res, next) {
        try {
            const { productId, targetProductId } = req.params;

            const related = await relatedService.removeRelatedItem(
                productId,
                targetProductId
            );

            return new ApiResponse(
                res,
                200,
                "Related item removed successfully.",
                related
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const productId = req.params.productId;

            await relatedService.deleteRelated(
                productId,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Product related items deleted successfully."
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new RelatedController();
