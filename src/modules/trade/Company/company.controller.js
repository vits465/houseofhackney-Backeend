import companyService from "./company.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class CompanyController {

    // Create a new company
    async create(req, res, next) {
        try {
            const company = await companyService.createCompany(req.body, req.user._id);

            return new ApiResponse(
                res,
                201,
                "Company registered successfully.",
                company
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get all companies
    async getAll(req, res, next) {
        try {
            const companies = await companyService.getCompanies(req.query);

            return new ApiResponse(
                res,
                200,
                "Companies fetched successfully.",
                companies
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get company details by ID
    async getById(req, res, next) {
        try {
            const company = await companyService.getCompanyById(req.params.id);

            return new ApiResponse(
                res,
                200,
                "Company details fetched successfully.",
                company
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Update company details
    async update(req, res, next) {
        try {
            const company = await companyService.updateCompany(
                req.params.id,
                req.body,
                req.user._id
            );

            return new ApiResponse(
                res,
                200,
                "Company updated successfully.",
                company
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Delete company
    async delete(req, res, next) {
        try {
            await companyService.deleteCompany(req.params.id);

            return new ApiResponse(
                res,
                200,
                "Company deleted successfully."
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new CompanyController();
