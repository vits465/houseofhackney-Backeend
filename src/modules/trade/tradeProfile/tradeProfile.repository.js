import BaseRepository from "../../../shared/database/BaseRepository.js";
import TradeProfile from "./tradeProfile.model.js";
import { TRADE_PROFILE_POPULATE } from "../../../shared/populate/trade.populate.js";

class TradeProfileRepository extends BaseRepository {

    constructor() {
        super(TradeProfile, TRADE_PROFILE_POPULATE);
    }

    // Find trade profile by user ID
    async findByUser(userId) {
        return await this.findOne({
            user: userId,
            deletedAt: null,
        });
    }

    // Find pending trade applications
    async findPendingApplications() {
        return await this.findAll({
            status: { $in: ["PENDING", "UNDER_REVIEW"] },
            deletedAt: null,
        });
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
        ).populate(TRADE_PROFILE_POPULATE);
    }

}

export default new TradeProfileRepository();
