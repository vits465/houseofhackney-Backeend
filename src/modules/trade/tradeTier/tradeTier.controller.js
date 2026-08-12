import tradeTierService from "./tradeTier.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class TradeTierController {

    // Create a new trade tier (Admin)
    async create(req, res, next) {
        try {
            const tier = await tradeTierService.createTier(req.body, req.user._id);

            return new ApiResponse(
                res,
                201,
                "Trade tier created successfully.",
                tier
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get all active trade tiers
    async getAll(req, res, next) {
        try {
            const tiers = await tradeTierService.getActiveTiers();

            return new ApiResponse(
                res,
                200,
                "Trade tiers fetched successfully.",
                tiers
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get trade tier details by ID
    async getById(req, res, next) {
        try {
            const tier = await tradeTierService.getTierById(req.params.id);

            return new ApiResponse(
                res,
                200,
                "Trade tier fetched successfully.",
                tier
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Update trade tier (Admin)
    async update(req, res, next) {
        try {
            const tier = await tradeTierService.updateTier(
                req.params.id,
                req.body,
                req.user._id
            );

            return new ApiResponse(
                res,
                200,
                "Trade tier updated successfully.",
                tier
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Seed default trade tiers (Admin)
    async seed(req, res, next) {
        try {
            await tradeTierService.seedDefaultTiers(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Default trade tiers seeded successfully."
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new TradeTierController();
