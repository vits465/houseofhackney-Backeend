import BaseService from "../../../shared/database/BaseService.js";
import invoiceRepository from "./invoice.repository.js";
import orderRepository from "../Order/order.repository.js";
import shipmentRepository from "../Shipment/shipment.repository.js";
import paymentRepository from "../Payment/payment.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class InvoiceService extends BaseService {

    constructor() {
        super(invoiceRepository);
    }

    // Generate unique invoice number
    generateInvoiceNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `INV-${timestamp}-${random}`;
    }

    // Generate invoice for an existing order
    async generateInvoiceForOrder(userId, { orderId }) {
        const order = await orderRepository.findOne({
            _id: orderId,
            deletedAt: null,
        });

        if (!order) {
            throw new AppError("Order not found.", 404);
        }

        if (order.orderStatus === "CANCELLED") {
            throw new AppError("Cannot generate invoice for a cancelled order.", 400);
        }

        // Return existing invoice if already generated
        const existingInvoice = await this.repository.findByOrder(orderId);

        if (existingInvoice) {
            return existingInvoice;
        }

        // Fetch associated shipment and payment records if available
        const shipment = await shipmentRepository.findByOrder(orderId);
        const payment = await paymentRepository.findOne({ order: orderId, status: "COMPLETED", deletedAt: null });

        const invoiceNumber = this.generateInvoiceNumber();
        const isPaid = order.paymentStatus === "PAID";

        const invoiceData = {
            invoiceNumber,
            order: order._id,
            shipment: shipment ? shipment._id : null,
            payment: payment ? payment._id : null,
            user: order.user,
            billingAddress: order.billingAddress,
            items: order.items,
            subtotal: order.subtotal,
            discount: order.discount,
            tax: order.tax,
            shipping: order.shippingFee,
            grandTotal: order.grandTotal,
            currency: order.currency || "INR",
            status: isPaid ? "PAID" : "ISSUED",
            issuedAt: new Date(),
            paidAt: isPaid ? new Date() : null,
            pdf: `/api/v1/invoices/download/${invoiceNumber}.pdf`,
            createdBy: userId,
        };

        return await this.repository.create(invoiceData);
    }

    // Get user invoices list
    async getUserInvoices(userId) {
        return await this.repository.findByUser(userId);
    }

    // Get invoice details by ID
    async getInvoiceDetails(userId, invoiceId, isAdmin = false) {
        const query = isAdmin ? { _id: invoiceId, deletedAt: null } : { _id: invoiceId, user: userId, deletedAt: null };

        const invoice = await this.repository.findOne(query);

        if (!invoice) {
            throw new AppError("Invoice not found.", 404);
        }

        return invoice;
    }

    // Get invoice by order ID
    async getInvoiceByOrder(userId, orderId, isAdmin = false) {
        const invoice = await this.repository.findByOrder(orderId);

        if (!invoice) {
            throw new AppError("Invoice not generated yet for this order.", 404);
        }

        if (!isAdmin && invoice.user.toString() !== userId.toString()) {
            throw new AppError("Unauthorized.", 403);
        }

        return invoice;
    }

    // Update invoice status (Admin)
    async updateInvoiceStatus(adminId, invoiceId, status) {
        const invoice = await this.repository.findById(invoiceId);

        if (!invoice || invoice.deletedAt) {
            throw new AppError("Invoice not found.", 404);
        }

        const extraData = { updatedBy: adminId };

        if (status.toUpperCase() === "PAID") {
            extraData.paidAt = new Date();
        }

        return await this.repository.updateStatus(invoice._id, status.toUpperCase(), extraData);
    }

}

export default new InvoiceService();
