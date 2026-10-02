import tradeProfileService from "./tradeProfile.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class TradeProfileController {

    // Apply for trade account (Customer)
    async apply(req, res, next) {
        try {
            const profile = await tradeProfileService.applyForTrade(req.user._id, req.body);

            return new ApiResponse(
                res,
                201,
                "Trade account application submitted successfully.",
                profile
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get current user trade profile
    async getMyProfile(req, res, next) {
        try {
            const profile = await tradeProfileService.getProfileByUser(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Trade profile fetched successfully.",
                profile
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get all trade profiles (Admin)
    async getAllProfiles(req, res, next) {
        try {
            const profiles = await tradeProfileService.getAllProfiles();

            return new ApiResponse(
                res,
                200,
                "All trade profiles fetched successfully.",
                profiles
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get pending applications (Admin)
    async getPendingApplications(req, res, next) {
        try {
            const applications = await tradeProfileService.getPendingApplications();

            return new ApiResponse(
                res,
                200,
                "Pending trade applications fetched successfully.",
                applications
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Review application: Approve / Reject (Admin)
    async review(req, res, next) {
        try {
            const profile = await tradeProfileService.reviewApplication(
                req.user._id,
                req.params.id,
                req.body
            );

            return new ApiResponse(
                res,
                200,
                "Trade application reviewed successfully.",
                profile
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new TradeProfileController();
