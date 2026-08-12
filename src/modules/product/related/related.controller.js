import relatedService from "./related.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class RelatedController {

    async get(req, res, next) {

        try {

            const productId = req.params.productId;

            const related = await relatedService.getByProduct(productId);

            return new ApiResponse(
                res,
                200,
                "Product related items fetched successfully.",
                related
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
