import BaseService from "../../../shared/database/BaseService.js";
import tradeProfileRepository from "./tradeProfile.repository.js";
import companyRepository from "../Company/company.repository.js";
import tradeTierRepository from "../tradeTier/tradeTier.repository.js";
import userService from "../../user/user.service.js";
import AppError from "../../../shared/errors/AppError.js";

class TradeProfileService extends BaseService {

    constructor() {
        super(tradeProfileRepository);
    }

    // Apply for trade account (Customer)
    async applyForTrade(userId, profileData) {
        const existing = await this.repository.findByUser(userId);

        const contactPhone = (profileData.phone || profileData.companyPhone || "").toString().trim();
        if (!contactPhone) {
            throw new AppError("Contact phone number is required.", 400);
        }
        profileData.phone = contactPhone;

        if (profileData.businessType === "HOSPITALITY") {
            profileData.businessType = "HOTEL_HOSPITALITY";
        }

        // If user already applied
        if (existing) {
            if (existing.status === "APPROVED") {
                throw new AppError("Your trade partner account is already active and approved.", 400);
            }

            // Update existing company if linked
            const companyId = existing.company?._id || existing.company;
            if (companyId) {
                await companyRepository.update(companyId, {
                    name: profileData.companyName || profileData.name || (existing.company && existing.company.name),
                    phone: contactPhone,
                    website: profileData.website || "",
                    taxNumber: profileData.taxId || profileData.gstNumber || profileData.vatNumber || "",
                });
            }

            // Update existing profile
            const updated = await this.repository.update(existing._id, {
                phone: contactPhone,
                businessType: profileData.businessType || existing.businessType,
                website: profileData.website || existing.website,
                gstNumber: profileData.gstNumber || profileData.taxId || existing.gstNumber,
                vatNumber: profileData.vatNumber || profileData.taxId || existing.vatNumber,
                status: "PENDING",
                rejectionReason: profileData.notes || existing.rejectionReason || "",
                updatedBy: userId,
            });

            return updated;
        }

        // If company details provided directly or name supplied, create or link company
        let companyId = profileData.company;

        if (!companyId) {
            const companyPayload = profileData.companyData || {
                name: profileData.companyName || profileData.name || "Trade Design Studio",
                phone: contactPhone,
                website: profileData.website || "",
                taxNumber: profileData.taxId || profileData.gstNumber || profileData.vatNumber || "",
                country: profileData.country || "India",
            };

            const company = await companyRepository.create({
                ...companyPayload,
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
        if (profileData.taxId && !profileData.gstNumber) {
            profileData.gstNumber = profileData.taxId;
        }

        const created = await this.repository.create(profileData);

        // Update User model flags
        try {
            await userService.update(userId, {
                isTradeAccount: true,
                accountType: "BUSINESS",
                tradeProfile: created._id,
            });
        } catch (err) {
            console.warn("Could not update user trade flags:", err.message);
        }

        return created;
    }

    // Get user trade profile
    async getProfileByUser(userId) {
        const profile = await this.repository.findByUser(userId);

        if (!profile) {
            throw new AppError("No trade account profile found.", 404);
        }

        return profile;
    }

    // Get all trade profiles (Admin)
    async getAllProfiles() {
        return await this.repository.findAll({});
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

        const updatedProfile = await this.repository.updateStatus(profile._id, uppercaseStatus, extraData);

        if (uppercaseStatus === "APPROVED") {
            try {
                const targetUserId = profile.user?._id || profile.user;
                if (targetUserId) {
                    await userService.update(targetUserId, {
                        isTradeAccount: true,
                        accountType: "BUSINESS",
                        tradeProfile: profile._id,
                    });
                }
            } catch (err) {
                console.warn("Could not update user trade status upon approval:", err.message);
            }
        }

        return updatedProfile;
    }

}

export default new TradeProfileService();
