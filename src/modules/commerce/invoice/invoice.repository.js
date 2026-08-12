import BaseRepository from "../../../shared/database/BaseRepository.js";
import Invoice from "./invoice.model.js";

class InvoiceRepository extends BaseRepository {

    constructor() {
        super(Invoice);
    }

    // Find invoice by order ID
    async findByOrder(orderId) {
        return await this.model.findOne({
            order: orderId,
            deletedAt: null,
        }).populate("order", "orderNumber orderStatus grandTotal");
    }

    // Find all invoices for a specific user
    async findByUser(userId) {
        return await this.model.find({
            user: userId,
            deletedAt: null,
        }).sort({ createdAt: -1 });
    }

    // Find invoice by unique invoice number
    async findByInvoiceNumber(invoiceNumber) {
        return await this.model.findOne({
            invoiceNumber: invoiceNumber.trim().toUpperCase(),
            deletedAt: null,
        });
    }

    // Update invoice status
    async updateStatus(invoiceId, status, extraData = {}) {
        return await this.model.findOneAndUpdate(
            { _id: invoiceId, deletedAt: null },
            {
                $set: {
                    status,
                    ...extraData,
                },
            },
            { new: true }
        );
    }

}

export default new InvoiceRepository();
