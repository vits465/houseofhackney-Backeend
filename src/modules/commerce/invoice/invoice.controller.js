import invoiceService from "./invoice.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class InvoiceController {

    // Generate invoice for order
    async generate(req, res, next) {
        try {
            const invoice = await invoiceService.generateInvoiceForOrder(req.user._id, req.body);

            return new ApiResponse(
                res,
                201,
                "Invoice generated successfully.",
                invoice
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get user invoices
    async getAll(req, res, next) {
        try {
            const invoices = await invoiceService.getUserInvoices(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Invoices fetched successfully.",
                invoices
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get invoice details by ID
    async getById(req, res, next) {
        try {
            const isAdmin = req.user.roles?.some(r => r.slug === "admin" || r.slug === "super_admin");
            const invoice = await invoiceService.getInvoiceDetails(req.user._id, req.params.id, isAdmin);

            return new ApiResponse(
                res,
                200,
                "Invoice details fetched successfully.",
                invoice
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get invoice details by order ID
    async getByOrder(req, res, next) {
        try {
            const isAdmin = req.user.roles?.some(r => r.slug === "admin" || r.slug === "super_admin");
            const invoice = await invoiceService.getInvoiceByOrder(req.user._id, req.params.orderId, isAdmin);

            return new ApiResponse(
                res,
                200,
                "Invoice details fetched successfully.",
                invoice
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Update invoice status (Admin)
    async updateStatus(req, res, next) {
        try {
            const invoice = await invoiceService.updateInvoiceStatus(
                req.user._id,
                req.params.id,
                req.body.status
            );

            return new ApiResponse(
                res,
                200,
                "Invoice status updated successfully.",
                invoice
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new InvoiceController();
