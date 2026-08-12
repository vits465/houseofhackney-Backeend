import BaseService from "../../../shared/database/BaseService.js";
import tradeTierRepository from "./tradeTier.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class TradeTierService extends BaseService {

    constructor() {
        super(tradeTierRepository);
    }

    // Seed default trade tiers if not present
    async seedDefaultTiers(adminId) {
        const tiers = [
            { name: "BRONZE", description: "Bronze Trade Tier", discountPercentage: 5, creditLimit: 100000, paymentTerm: "IMMEDIATE" },
            { name: "SILVER", description: "Silver Trade Tier", discountPercentage: 10, creditLimit: 250000, paymentTerm: "NET_15" },
            { name: "GOLD", description: "Gold Trade Tier", discountPercentage: 15, creditLimit: 500000, paymentTerm: "NET_30", freeShipping: true },
            { name: "PLATINUM", description: "Platinum Trade Tier", discountPercentage: 25, creditLimit: 1000000, paymentTerm: "NET_60", freeShipping: true, prioritySupport: true },
        ];

        for (const tierData of tiers) {
            const exists = await this.repository.findByName(tierData.name);

            if (!exists) {
                await this.repository.create({
                    ...tierData,
                    createdBy: adminId,
                });
            }
        }
    }

    // Create a new trade tier
    async createTier(data, adminId) {
        const existing = await this.repository.findByName(data.name);

        if (existing) {
            throw new AppError("Trade tier with this name already exists.", 409);
        }

        data.name = data.name.trim().toUpperCase();
        data.createdBy = adminId;

        return await this.repository.create(data);
    }

    // Get active trade tiers list
    async getActiveTiers() {
        return await this.repository.findActive();
    }

    // Get tier details by ID
    async getTierById(tierId) {
        const tier = await this.repository.findOne({
            _id: tierId,
            deletedAt: null,
        });

        if (!tier) {
            throw new AppError("Trade tier not found.", 404);
        }

        return tier;
    }

    // Update trade tier
    async updateTier(tierId, updateData, adminId) {
        await this.getTierById(tierId);

        if (updateData.name) {
            updateData.name = updateData.name.trim().toUpperCase();
        }

        updateData.updatedBy = adminId;

        return await this.repository.update(tierId, updateData);
    }

}

export default new TradeTierService();
