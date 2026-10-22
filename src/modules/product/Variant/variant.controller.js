import variantService from "./variant.service.js";
import productService from "../product/product.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";
import AppError from "../../../shared/errors/AppError.js";

function formatVariantItem(v) {
    if (!v) return null;
    const vObj = typeof v.toObject === "function" ? v.toObject() : { ...v };

    const imagesSet = new Set();
    if (vObj.image && typeof vObj.image === "string") imagesSet.add(vObj.image.trim());
    const thumbUrl = vObj.thumbnail?.secureUrl || vObj.thumbnail?.url || (typeof vObj.thumbnail === "string" ? vObj.thumbnail : null);
    if (thumbUrl) imagesSet.add(thumbUrl);

    if (Array.isArray(vObj.images)) {
        vObj.images.forEach((img) => {
            if (typeof img === "string" && img.trim()) imagesSet.add(img.trim());
            else if (img?.secureUrl || img?.url) imagesSet.add((img.secureUrl || img.url).trim());
        });
    }

    const allImages = Array.from(imagesSet);
    const primaryImg = vObj.image || thumbUrl || allImages[0] || null;

    return {
        _id: vObj._id,
        id: vObj._id,
        title: vObj.title || vObj.name || "Default Variant",
        sku: vObj.sku || "",
        attributes: vObj.attributes || [],
        thumbnail: thumbUrl || primaryImg,
        image: primaryImg,
        images: allImages.length ? allImages : (primaryImg ? [primaryImg] : []),
        price: vObj.price ?? vObj.sellingPrice ?? null,
        isDefault: Boolean(vObj.isDefault),
        isActive: vObj.isActive !== false,
        stock: vObj.stockQuantity ?? 50,
        createdAt: vObj.createdAt,
    };
}

class VariantController {

    async create(req, res, next) {
        try {
            const variant = await variantService.createVariant({
                ...req.body,
                createdBy: req.user?._id,
            });

            return new ApiResponse(
                res,
                201,
                "Variant created successfully.",
                formatVariantItem(variant)
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const rawProductId = req.params.productId || req.query.productId || req.query.product;
            let product = null;

            if (rawProductId) {
                product = (await productService.findById(rawProductId)) || (await productService.getBySlug(rawProductId));
                if (!product || product.deletedAt) {
                    throw new AppError("Product not found.", 404);
                }
            }

            const filter = { deletedAt: null };
            if (product) filter.product = product._id;

            const variants = product
                ? await variantService.getVariants(product._id)
                : await variantService.findAll(filter);

            const formatted = (variants || []).map(formatVariantItem);

            return new ApiResponse(
                res,
                200,
                "Variants fetched successfully.",
                formatted
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const variant = await variantService.findById(req.params.id);

            if (!variant || variant.deletedAt) {
                return new ApiResponse(res, 404, "Variant not found.").send();
            }

            return new ApiResponse(
                res,
                200,
                "Variant fetched successfully.",
                formatVariantItem(variant)
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const variant = await variantService.updateVariant(
                req.params.id,
                {
                    ...req.body,
                    updatedBy: req.user?._id,
                }
            );

            return new ApiResponse(
                res,
                200,
                "Variant updated successfully.",
                formatVariantItem(variant)
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await variantService.deleteVariant(
                req.params.id,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Variant deleted successfully."
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new VariantController();