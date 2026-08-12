import BaseService from "../../../shared/database/BaseService.js";
import tradeProfileRepository from "./tradeProfile.repository.js";
import companyRepository from "../Company/company.repository.js";
import tradeTierRepository from "../tradeTier/tradeTier.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class TradeProfileService extends BaseService {

    constructor() {
        super(tradeProfileRepository);
    }

    // Apply for trade account (Customer)
    async applyForTrade(userId, profileData) {
        const existing = await this.repository.findByUser(userId);

        if (existing) {
            throw new AppError(`You have already submitted a trade application (Status: ${existing.status}).`, 409);
        }

        // If company details provided directly, create or link company
        let companyId = profileData.company;

        if (!companyId && profileData.companyData) {
            const company = await companyRepository.create({
                ...profileData.companyData,
                createdBy: userId,
            });
            companyId = company._id;
        }

        if (!companyId) {
            throw new AppError("Company information or companyId is required for trade application.", 400);
        }

        profileData.user = userId;
        profileData.company = companyId;
        profileData.status = "PENDING";
        profileData.createdBy = userId;

        return await this.repository.create(profileData);
    }

    // Get user trade profile
    async getProfileByUser(userId) {
        const profile = await this.repository.findByUser(userId);

        if (!profile) {
            throw new AppError("No trade account profile found.", 404);
        }

        return profile;
    }

    // Get pending applications (Admin)
    async getPendingApplications() {
        return await this.repository.findPendingApplications();
    }

    // Review application: Approve / Reject (Admin)
    async reviewApplication(adminId, profileId, { status, tierId, creditLimit, rejectionReason = "" }) {
        const profile = await this.repository.findOne({ _id: profileId, deletedAt: null });

        if (!profile) {
            throw new AppError("Trade application not found.", 404);
        }

        const uppercaseStatus = status.toUpperCase();

        if (!["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(uppercaseStatus)) {
            throw new AppError("Status must be APPROVED, REJECTED, or UNDER_REVIEW.", 400);
        }

        const extraData = {
            updatedBy: adminId,
        };

        if (uppercaseStatus === "APPROVED") {
            let assignedTier = null;

            if (tierId) {
                assignedTier = await tradeTierRepository.findById(tierId);
            } else {
                assignedTier = await tradeTierRepository.findByName("BRONZE");
            }

            extraData.tier = assignedTier ? assignedTier._id : null;
            extraData.creditLimit = creditLimit !== undefined ? Number(creditLimit) : (assignedTier?.creditLimit || 100000);
            extraData.approvedAt = new Date();
            extraData.approvedBy = adminId;
        } else if (uppercaseStatus === "REJECTED") {
            extraData.rejectionReason = rejectionReason || "Application rejected by administrator";
        }

        return await this.repository.updateStatus(profile._id, uppercaseStatus, extraData);
    }

}

export default new TradeProfileService();
