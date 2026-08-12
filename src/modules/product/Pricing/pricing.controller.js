import pricingService from "./pricing.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class PricingController {

    async create(req, res, next) {

        try {

            const pricing = await pricingService.createPricing({
                ...req.body,
                createdBy: req.user?._id,
            });

            return new ApiResponse(
                res,
                201,
                "Pricing created successfully.",
                pricing
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async get(req, res, next) {

        try {

            const pricing =
                await pricingService.getPricing(
                    req.params.productId
                );

            return new ApiResponse(
                res,
                200,
                "Pricing fetched successfully.",
                pricing
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async update(req, res, next) {

        try {

            const pricing =
                await pricingService.updatePricing(
                    req.params.productId,
                    {
                        ...req.body,
                        updatedBy: req.user?._id,
                    }
                );

            return new ApiResponse(
                res,
                200,
                "Pricing updated successfully.",
                pricing
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async delete(req, res, next) {

        try {

            await pricingService.deletePricing(
                req.params.productId,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Pricing deleted successfully."
            ).send();

        } catch (error) {
            next(error);
        }

    }

}

export default new PricingController();