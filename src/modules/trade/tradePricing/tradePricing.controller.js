import tradePricingService from "./tradePricing.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class TradePricingController {

    // Set trade pricing for product (Admin)
    async setPricing(req, res, next) {
        try {
            const pricing = await tradePricingService.setPricing(req.user._id, req.body);

            return new ApiResponse(
                res,
                200,
                "Trade pricing set successfully.",
                pricing
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get trade pricings by product
    async getByProduct(req, res, next) {
        try {
            const pricings = await tradePricingService.getPricingsByProduct(req.params.productId);

            return new ApiResponse(
                res,
                200,
                "Trade pricings fetched successfully.",
                pricings
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new TradePricingController();
