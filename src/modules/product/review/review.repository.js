import BaseRepository from "../../../shared/database/BaseRepository.js";
import Review from "./review.model.js";

class ReviewRepository extends BaseRepository {

    constructor() {
        super(Review);
    }

    async findByProduct(productId, filter = {}) {

        return await this.model.find({
            product: productId,
            deletedAt: null,
            ...filter,
        })
            .populate("user", "firstName lastName avatar")
            .populate("variant", "name sku")
            .populate("images")
            .populate("adminReply.repliedBy", "firstName lastName")
            .sort({ createdAt: -1 });

    }

    async findByUser(userId) {

        return await this.model.find({
            user: userId,
            deletedAt: null,
        })
            .populate("product", "name slug thumbnail")
            .populate("variant", "name sku")
            .sort({ createdAt: -1 });

    }

    async findUserProductReview(userId, productId) {

        return await this.model.findOne({
            user: userId,
            product: productId,
            deletedAt: null,
        });

    }

    async likeReview(reviewId) {

        return await this.model.findOneAndUpdate(
            {
                _id: reviewId,
                deletedAt: null,
            },
            {
                $inc: { likes: 1 },
            },
            { new: true }
        );

    }

    async dislikeReview(reviewId) {

        return await this.model.findOneAndUpdate(
            {
                _id: reviewId,
                deletedAt: null,
            },
            {
                $inc: { dislikes: 1 },
            },
            { new: true }
        );

    }

    async addAdminReply(reviewId, message, repliedBy) {

        return await this.model.findOneAndUpdate(
            {
                _id: reviewId,
                deletedAt: null,
            },
            {
                adminReply: {
                    message,
                    repliedBy,
                    repliedAt: new Date(),
                },
                updatedBy: repliedBy,
            },
            { new: true }
        ).populate("adminReply.repliedBy", "firstName lastName");

    }

    async updateStatus(reviewId, status, updatedBy) {

        return await this.model.findOneAndUpdate(
            {
                _id: reviewId,
                deletedAt: null,
            },
            {
                status,
                updatedBy,
            },
            { new: true }
        );

    }

    async getProductRatingStats(productId) {

        const stats = await this.model.aggregate([
            {
                $match: {
                    product: new (this.model.base.Types.ObjectId)(productId),
                    status: "APPROVED",
                    deletedAt: null,
                },
            },
            {
                $group: {
                    _id: "$product",
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    star5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                    star4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                    star3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                    star2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                    star1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
                },
            },
        ]);

        if (stats.length === 0) {
            return {
                avgRating: 0,
                totalReviews: 0,
                breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            };
        }

        const data = stats[0];

        return {
            avgRating: Math.round(data.avgRating * 10) / 10,
            totalReviews: data.totalReviews,
            breakdown: {
                5: data.star5,
                4: data.star4,
                3: data.star3,
                2: data.star2,
                1: data.star1,
            },
        };

    }

}

export default new ReviewRepository();
