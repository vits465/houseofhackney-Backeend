import productMediaService from "./productMedia.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class ProductMediaController {

    async create(req, res, next) {

        try {

            const productId = req.body.product || req.params.productId;

            const media =
                await productMediaService.createMedia({
                    ...req.body,
                    product: productId,
                    createdBy: req.user?._id,
                });

            return new ApiResponse(
                res,
                201,
                "Product media created successfully.",
                media
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async get(req, res, next) {

        try {

            const media =
                await productMediaService.getMedia(
                    req.params.productId
                );

            return new ApiResponse(
                res,
                200,
                "Product media fetched successfully.",
                media
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async update(req, res, next) {

        try {

            const media =
                await productMediaService.updateMedia(
                    req.params.productId,
                    {
                        ...req.body,
                        updatedBy: req.user?._id,
                    }
                );

            return new ApiResponse(
                res,
                200,
                "Product media updated successfully.",
                media
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async delete(req, res, next) {

        try {

            await productMediaService.deleteMedia(
                req.params.productId,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Product media deleted successfully."
            ).send();

        } catch (error) {
            next(error);
        }

    }

}

export default new ProductMediaController();