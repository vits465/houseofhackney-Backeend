import BaseRepository from "../../../shared/database/BaseRepository.js";
import TradeProfile from "./tradeProfile.model.js";

class TradeProfileRepository extends BaseRepository {

    constructor() {
        super(TradeProfile);
    }

    // Find trade profile by user ID
    async findByUser(userId) {
        return await this.model.findOne({
            user: userId,
            deletedAt: null,
        })
            .populate("company")
            .populate("tier");
    }

    // Find pending trade applications
    async findPendingApplications() {
        return await this.model.find({
            status: { $in: ["PENDING", "UNDER_REVIEW"] },
            deletedAt: null,
        })
            .populate("user", "fullName email")
            .populate("company");
    }

    // Update trade application approval status
    async updateStatus(profileId, status, extraData = {}) {
        return await this.model.findOneAndUpdate(
            { _id: profileId, deletedAt: null },
            {
                $set: {
                    status,
                    ...extraData,
                },
            },
            { new: true }
        )
            .populate("company")
            .populate("tier");
    }

}

export default new TradeProfileRepository();
