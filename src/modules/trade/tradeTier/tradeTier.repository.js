import BaseRepository from "../../../shared/database/BaseRepository.js";
import TradeTier from "./tradeTier.model.js";

class TradeTierRepository extends BaseRepository {

    constructor() {
        super(TradeTier);
    }

    // Find trade tier by name
    async findByName(name) {
        return await this.findOne({
            name: name.trim().toUpperCase(),
            deletedAt: null,
        });
    }

    // Find all active trade tiers sorted by discount percentage
    async findActive() {
        return await this.findAll({
            status: "ACTIVE",
            deletedAt: null,
        }, null, { sort: { discountPercentage: 1 } });
    }

}

export default new TradeTierRepository();
