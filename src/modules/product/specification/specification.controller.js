import specificationService from "./specification.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class SpecificationController {

    async get(req, res, next) {

        try {

            const specification = await specificationService.getByProduct(
                req.params.productId
            );

            return new ApiResponse(
                res,
                200,
                "Product specification fetched successfully.",
                specification
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async create(req, res, next) {

        try {

            const productId = req.body.product || req.params.productId;

            const specification = await specificationService.createSpecification({
                ...req.body,
                product: productId,
                createdBy: req.user?._id,
            });

            return new ApiResponse(
                res,
                201,
                "Product specification created successfully.",
                specification
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async update(req, res, next) {

        try {

            const specification = await specificationService.updateSpecification(
                req.params.productId,
                {
                    ...req.body,
                    updatedBy: req.user?._id,
                }
            );

            return new ApiResponse(
                res,
                200,
                "Product specification updated successfully.",
                specification
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async delete(req, res, next) {

        try {

            await specificationService.deleteSpecification(
                req.params.productId,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Product specification deleted successfully."
            ).send();

        } catch (error) {
            next(error);
        }

    }

}

export default new SpecificationController();
