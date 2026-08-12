import BaseService from "../../../shared/database/BaseService.js";
import reviewRepository from "./review.repository.js";
import productRepository from "../product/product.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class ReviewService extends BaseService {

    constructor() {
        super(reviewRepository);
    }

    async createReview(userId, data) {

        const product = await productRepository.findById(data.product);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        const existing = await this.repository.findUserProductReview(
            userId,
            data.product
        );

        if (existing) {
            throw new AppError(
                "You have already submitted a review for this product.",
                409
            );
        }

        return await this.repository.create({
            ...data,
            user: userId,
            createdBy: userId,
        });

    }

    async getProductReviews(productId, userRole = null) {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        const filter = userRole === "ADMIN" ? {} : { status: "APPROVED" };

        return await this.repository.findByProduct(productId, filter);

    }

    async getUserReviews(userId) {

        return await this.repository.findByUser(userId);

    }

    async getRatingSummary(productId) {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        return await this.repository.getProductRatingStats(productId);

    }

    async updateReview(reviewId, userId, data) {

        const review = await this.repository.findById(reviewId);

        if (!review) {
            throw new AppError("Review not found.", 404);
        }

        if (review.user.toString() !== userId.toString()) {
            throw new AppError("Permission denied. You can only edit your own review.", 403);
        }

        return await this.repository.update(reviewId, {
            ...data,
            status: "PENDING",
            updatedBy: userId,
        });

    }

    async likeReview(reviewId) {

        const review = await this.repository.findById(reviewId);

        if (!review) {
            throw new AppError("Review not found.", 404);
        }

        return await this.repository.likeReview(reviewId);

    }

    async dislikeReview(reviewId) {

        const review = await this.repository.findById(reviewId);

        if (!review) {
            throw new AppError("Review not found.", 404);
        }

        return await this.repository.dislikeReview(reviewId);

    }

    async addAdminReply(reviewId, message, adminId) {

        const review = await this.repository.findById(reviewId);

        if (!review) {
            throw new AppError("Review not found.", 404);
        }

        return await this.repository.addAdminReply(reviewId, message, adminId);

    }

    async updateStatus(reviewId, status, adminId) {

        const review = await this.repository.findById(reviewId);

        if (!review) {
            throw new AppError("Review not found.", 404);
        }

        return await this.repository.updateStatus(reviewId, status, adminId);

    }

    async deleteReview(reviewId, userId, userRole) {

        const review = await this.repository.findById(reviewId);

        if (!review) {
            throw new AppError("Review not found.", 404);
        }

        if (userRole !== "ADMIN" && review.user.toString() !== userId.toString()) {
            throw new AppError("Permission denied.", 403);
        }

        return await this.repository.softDelete(reviewId, {
            updatedBy: userId,
        });

    }

}

export default new ReviewService();
