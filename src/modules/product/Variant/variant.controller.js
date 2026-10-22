import variantService from "./variant.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

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
                variant
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const productId = req.params.productId || req.query.productId || req.query.product;
            const filter = { deletedAt: null };
            if (productId) filter.product = productId;

            const variants = productId
                ? await variantService.getVariants(productId)
                : await variantService.findAll(filter);

            return new ApiResponse(
                res,
                200,
                "Variants fetched successfully.",
                variants
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const variant = await variantService.findById(req.params.id);

            if (!variant) {
                return new ApiResponse(res, 404, "Variant not found.").send();
            }

            return new ApiResponse(
                res,
                200,
                "Variant fetched successfully.",
                variant
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
                variant
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