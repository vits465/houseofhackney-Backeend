import variantService from "./variant.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class VariantController {

    async create(req, res, next) {

        try {

            const variant =
                await variantService.createVariant({
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

            const variants =
                await variantService.getVariants(
                    req.params.productId
                );

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

    async update(req, res, next) {

        try {

            const variant =
                await variantService.updateVariant(
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