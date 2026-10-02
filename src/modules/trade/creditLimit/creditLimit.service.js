import BaseService from "../../../shared/database/BaseService.js";
import creditLimitRepository from "./creditLimit.repository.js";
import tradeProfileRepository from "../tradeProfile/tradeProfile.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class CreditLimitService extends BaseService {

    constructor() {
        super(creditLimitRepository);
    }

    // Set credit limit for company (Admin)
    async setCreditLimit(adminId, { companyId, userId, totalCredit, paymentTerm = "NET_30" }) {
        const existing = await this.repository.findByCompany(companyId);

        const creditAmount = Number(totalCredit);

        if (existing) {
            const used = existing.usedCredit || 0;
            const available = Math.max(0, creditAmount - used);
            const status = used > creditAmount ? "EXCEEDED" : "ACTIVE";

            return await this.repository.update(existing._id, {
                totalCredit: creditAmount,
                availableCredit: available,
                paymentTerm,
                status,
                updatedBy: adminId,
            });
        }

        return await this.repository.create({
            company: companyId,
            user: userId,
            totalCredit: creditAmount,
            usedCredit: 0,
            availableCredit: creditAmount,
            pendingCredit: 0,
            paymentTerm,
            status: "ACTIVE",
            createdBy: adminId,
        });
    }

    // Get all credit limits (Admin)
    async getAllCreditLimits() {
        return await this.repository.findAll({});
    }

    // Get user credit limit & usage
    async getUserCreditLimit(userId) {
        let credit = await this.repository.findByUser(userId);

        if (!credit) {
            const profile = await tradeProfileRepository.findByUser(userId);
            if (profile && profile.company) {
                credit = await this.repository.findByCompany(profile.company._id || profile.company);
            }
        }

        if (!credit) {
            throw new AppError("No credit limit account found.", 404);
        }

        return credit;
    }

    // Utilize credit for a B2B order
    async utilizeCredit(companyId, amount) {
        const credit = await this.repository.findByCompany(companyId);

        if (!credit || credit.status !== "ACTIVE") {
            throw new AppError("Active credit line account is required.", 400);
        }

        if (credit.availableCredit < amount) {
            throw new AppError(`Credit limit exceeded. Available credit: ₹${credit.availableCredit}, requested: ₹${amount}`, 400);
        }

        const newUsed = credit.usedCredit + amount;
        const newAvailable = credit.availableCredit - amount;
        const status = newAvailable <= 0 ? "EXCEEDED" : "ACTIVE";

        return await this.repository.update(credit._id, {
            usedCredit: newUsed,
            availableCredit: newAvailable,
            status,
        });
    }

    // Release credit when order invoice is paid
    async releaseCredit(companyId, amount) {
        const credit = await this.repository.findByCompany(companyId);

        if (!credit) return null;

        const newUsed = Math.max(0, credit.usedCredit - amount);
        const newAvailable = credit.totalCredit - newUsed;
        const status = newAvailable > 0 ? "ACTIVE" : credit.status;

        return await this.repository.update(credit._id, {
            usedCredit: newUsed,
            availableCredit: newAvailable,
            status,
        });
    }

}

export default new CreditLimitService();
