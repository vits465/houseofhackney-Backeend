import paymentService from "./payment.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class PaymentController {

    // Initiate payment session
    async initiate(req, res, next) {
        try {
            const result = await paymentService.initiatePayment(req.user._id, req.body);

            return new ApiResponse(
                res,
                201,
                "Payment session initiated successfully.",
                result
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Verify payment callback/webhook
    async verify(req, res, next) {
        try {
            const payment = await paymentService.verifyPayment(req.user._id, req.body);

            return new ApiResponse(
                res,
                200,
                "Payment verification completed.",
                payment
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get user payments list
    async getUserPayments(req, res, next) {
        try {
            const isAdmin = req.user.roles?.some(r => r.slug === "admin" || r.slug === "super_admin" || r.slug === "super-admin");
            const payments = isAdmin
                ? await paymentService.repository.findAll({})
                : await paymentService.getUserPayments(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Payments fetched successfully.",
                payments
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get payment details
    async getPaymentDetails(req, res, next) {
        try {
            const isAdmin = req.user.roles?.some(r => r.slug === "admin" || r.slug === "super_admin");
            const payment = await paymentService.getPaymentDetails(req.user._id, req.params.id, isAdmin);

            return new ApiResponse(
                res,
                200,
                "Payment details fetched successfully.",
                payment
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Process refund (Admin)
    async refund(req, res, next) {
        try {
            const payment = await paymentService.processRefund(req.user._id, {
                paymentId: req.params.id,
                ...req.body,
            });

            return new ApiResponse(
                res,
                200,
                "Payment refunded successfully.",
                payment
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new PaymentController();
