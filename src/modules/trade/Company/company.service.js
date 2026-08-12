import BaseService from "../../../shared/database/BaseService.js";
import companyRepository from "./company.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class CompanyService extends BaseService {

    constructor() {
        super(companyRepository);
    }

    // Create a new company
    async createCompany(companyData, userId) {
        if (companyData.taxNumber) {
            const existing = await this.repository.findByTaxNumber(companyData.taxNumber);

            if (existing) {
                throw new AppError("Company with this GST/VAT tax number already exists.", 409);
            }
        }

        companyData.createdBy = userId;

        return await this.repository.create(companyData);
    }

    // Get active companies list
    async getCompanies(filter = {}) {
        return await this.repository.findAll({
            ...filter,
            deletedAt: null,
        });
    }

    // Get company details by ID
    async getCompanyById(companyId) {
        const company = await this.repository.findOne({
            _id: companyId,
            deletedAt: null,
        });

        if (!company) {
            throw new AppError("Company record not found.", 404);
        }

        return company;
    }

    // Update company details
    async updateCompany(companyId, updateData, userId) {
        await this.getCompanyById(companyId);

        updateData.updatedBy = userId;

        return await this.repository.update(companyId, updateData);
    }

    // Delete company (soft delete)
    async deleteCompany(companyId) {
        await this.getCompanyById(companyId);

        return await this.repository.softDelete(companyId);
    }

}

export default new CompanyService();
