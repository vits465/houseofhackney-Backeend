import quotationService from "./quotation.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class QuotationController {

    // Request a quote (Trade Customer)
    async request(req, res, next) {
        try {
            const quote = await quotationService.requestQuote(req.user._id, req.body);

            return new ApiResponse(
                res,
                201,
                "Quotation requested successfully.",
                quote
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get user quotes list
    async getUserQuotes(req, res, next) {
        try {
            const quotes = await quotationService.getUserQuotes(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Quotations fetched successfully.",
                quotes
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get quote details
    async getQuoteById(req, res, next) {
        try {
            const isAdmin = req.user.roles?.some(r => r.slug === "admin" || r.slug === "super_admin");
            const quote = await quotationService.getQuoteById(req.user._id, req.params.id, isAdmin);

            return new ApiResponse(
                res,
                200,
                "Quotation details fetched successfully.",
                quote
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Negotiate quote (Admin)
    async negotiate(req, res, next) {
        try {
            const quote = await quotationService.negotiateQuote(
                req.user._id,
                req.params.id,
                req.body
            );

            return new ApiResponse(
                res,
                200,
                "Quotation price negotiated successfully.",
                quote
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Approve quote
    async approve(req, res, next) {
        try {
            const quote = await quotationService.approveQuote(req.user._id, req.params.id);

            return new ApiResponse(
                res,
                200,
                "Quotation approved successfully.",
                quote
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Convert quotation to order
    async convertToOrder(req, res, next) {
        try {
            const order = await quotationService.convertToOrder(
                req.user._id,
                req.params.id,
                req.body.shippingAddress
            );

            return new ApiResponse(
                res,
                201,
                "Quotation converted to B2B Trade Order successfully.",
                order
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new QuotationController();
