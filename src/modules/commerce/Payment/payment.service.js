import BaseService from "../../../shared/database/BaseService.js";
import paymentRepository from "./payment.repository.js";
import orderRepository from "../Order/order.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class PaymentService extends BaseService {

    constructor() {
        super(paymentRepository);
    }

    // Generate unique transaction ID
    generateTransactionId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `TXN-${timestamp}-${random}`;
    }

    // Initiate payment session for an order
    async initiatePayment(userId, { orderId, provider = "COD", paymentMethod = "COD" }) {
        const order = await orderRepository.findOne({
            _id: orderId,
            user: userId,
            deletedAt: null,
        });

        if (!order) {
            throw new AppError("Order not found.", 404);
        }

        if (order.paymentStatus === "PAID") {
            throw new AppError("This order has already been paid.", 400);
        }

        if (order.orderStatus === "CANCELLED") {
            throw new AppError("Cannot initiate payment for a cancelled order.", 400);
        }

        const transactionId = this.generateTransactionId();

        const paymentData = {
            transactionId,
            order: order._id,
            user: userId,
            provider: provider.toUpperCase(),
            paymentMethod: paymentMethod.toUpperCase(),
            amount: order.grandTotal,
            currency: order.currency || "INR",
            status: provider === "COD" ? "COMPLETED" : "PENDING",
            paidAt: provider === "COD" ? new Date() : null,
            createdBy: userId,
        };

        const payment = await this.repository.create(paymentData);

        // If Cash on Delivery, automatically mark order payment status
        if (provider === "COD") {
            await orderRepository.updatePaymentStatus(order._id, "PAID");
            await orderRepository.updateOrderStatus(order._id, "CONFIRMED", userId);
        }

        return {
            payment,
            checkoutUrl: provider === "COD" ? null : `https://checkout.gateway.com/pay/${transactionId}`,
        };
    }

    // Verify payment status webhook/callback
    async verifyPayment(userId, { paymentId, gatewayTransactionId = "", status = "COMPLETED", failureReason = "" }) {
        const payment = await this.repository.findOne({
            _id: paymentId,
            deletedAt: null,
        });

        if (!payment) {
            throw new AppError("Payment transaction not found.", 404);
        }

        if (payment.status === "COMPLETED") {
            return payment;
        }

        const isCompleted = status.toUpperCase() === "COMPLETED";
        const newStatus = isCompleted ? "COMPLETED" : "FAILED";

        const updatedPayment = await this.repository.updatePaymentStatus(payment._id, newStatus, {
            gatewayTransactionId: gatewayTransactionId || `GW-${Date.now()}`,
            paidAt: isCompleted ? new Date() : null,
            failureReason: isCompleted ? "" : failureReason || "Payment authorization failed",
            updatedBy: userId,
        });

        // Update corresponding order status
        if (isCompleted) {
            await orderRepository.updatePaymentStatus(payment.order, "PAID");
            await orderRepository.updateOrderStatus(payment.order, "CONFIRMED", userId);
        } else {
            await orderRepository.updatePaymentStatus(payment.order, "FAILED");
        }

        return updatedPayment;
    }

    // Get all user payments
    async getUserPayments(userId) {
        return await this.repository.findAll({
            user: userId,
            deletedAt: null,
        });
    }

    // Get payment details
    async getPaymentDetails(userId, paymentId, isAdmin = false) {
        const query = isAdmin ? { _id: paymentId, deletedAt: null } : { _id: paymentId, user: userId, deletedAt: null };

        const payment = await this.repository.findOne(query);

        if (!payment) {
            throw new AppError("Payment record not found.", 404);
        }

        return payment;
    }

    // Process refund (Admin)
    async processRefund(adminId, { paymentId, refundAmount, reason = "" }) {
        const payment = await this.repository.findOne({
            _id: paymentId,
            deletedAt: null,
        });

        if (!payment) {
            throw new AppError("Payment record not found.", 404);
        }

        if (payment.status !== "COMPLETED") {
            throw new AppError("Only completed payments can be refunded.", 400);
        }

        const amountToRefund = refundAmount ? Number(refundAmount) : payment.amount;

        if (amountToRefund > payment.amount) {
            throw new AppError("Refund amount cannot exceed original payment amount.", 400);
        }

        const updatedPayment = await this.repository.updatePaymentStatus(payment._id, "REFUNDED", {
            refundId: `RFND-${Date.now()}`,
            refundAmount: amountToRefund,
            refundedAt: new Date(),
            failureReason: reason ? `Refund reason: ${reason}` : "Refund processed by admin",
            updatedBy: adminId,
        });

        await orderRepository.updatePaymentStatus(payment.order, "REFUNDED");

        return updatedPayment;
    }

}

export default new PaymentService();
