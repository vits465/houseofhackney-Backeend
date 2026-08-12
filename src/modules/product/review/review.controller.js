import reviewService from "./review.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class ReviewController {

    async create(req, res, next) {

        try {

            const productId = req.params.productId || req.body.product;

            const review = await reviewService.createReview(
                req.user._id,
                {
                    ...req.body,
                    product: productId,
                }
            );

            return new ApiResponse(
                res,
                201,
                "Review submitted successfully and is pending approval.",
                review
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async getByProduct(req, res, next) {

        try {

            const productId = req.params.productId;

            const userRole = req.user?.role?.slug || req.user?.roles?.[0]?.slug;

            const reviews = await reviewService.getProductReviews(
                productId,
                userRole
            );

            return new ApiResponse(
                res,
                200,
                "Product reviews fetched successfully.",
                reviews
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async getRatingSummary(req, res, next) {

        try {

            const productId = req.params.productId;

            const summary = await reviewService.getRatingSummary(productId);

            return new ApiResponse(
                res,
                200,
                "Product rating summary fetched successfully.",
                summary
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async getMyReviews(req, res, next) {

        try {

            const reviews = await reviewService.getUserReviews(req.user._id);

            return new ApiResponse(
                res,
                200,
                "User reviews fetched successfully.",
                reviews
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async update(req, res, next) {

        try {

            const review = await reviewService.updateReview(
                req.params.id,
                req.user._id,
                req.body
            );

            return new ApiResponse(
                res,
                200,
                "Review updated successfully.",
                review
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async like(req, res, next) {

        try {

            const review = await reviewService.likeReview(req.params.id);

            return new ApiResponse(
                res,
                200,
                "Review liked successfully.",
                review
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async dislike(req, res, next) {

        try {

            const review = await reviewService.dislikeReview(req.params.id);

            return new ApiResponse(
                res,
                200,
                "Review disliked successfully.",
                review
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async addReply(req, res, next) {

        try {

            const review = await reviewService.addAdminReply(
                req.params.id,
                req.body.message,
                req.user._id
            );

            return new ApiResponse(
                res,
                200,
                "Admin reply added successfully.",
                review
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async updateStatus(req, res, next) {

        try {

            const review = await reviewService.updateStatus(
                req.params.id,
                req.body.status,
                req.user._id
            );

            return new ApiResponse(
                res,
                200,
                "Review status updated successfully.",
                review
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async delete(req, res, next) {

        try {

            const userRole = req.user?.roles?.[0]?.slug || req.user?.role?.slug;

            await reviewService.deleteReview(
                req.params.id,
                req.user._id,
                userRole
            );

            return new ApiResponse(
                res,
                200,
                "Review deleted successfully."
            ).send();

        } catch (error) {
            next(error);
        }

    }

}

export default new ReviewController();
