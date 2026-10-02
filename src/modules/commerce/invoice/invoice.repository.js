import BaseRepository from "../../../shared/database/BaseRepository.js";
import Invoice from "./invoice.model.js";
import { INVOICE_POPULATE } from "../../../shared/populate/commerce.populate.js";

class InvoiceRepository extends BaseRepository {

    constructor() {
        super(Invoice, INVOICE_POPULATE);
    }

    // Find invoice by order ID
    async findByOrder(orderId) {
        return await this.findOne({
            order: orderId,
            deletedAt: null,
        });
    }

    // Find all invoices for a specific user
    async findByUser(userId) {
        return await this.findAll({
            user: userId,
            deletedAt: null,
        }, null, { sort: { createdAt: -1 } });
    }

    // Find invoice by unique invoice number
    async findByInvoiceNumber(invoiceNumber) {
        return await this.findOne({
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
        ).populate(INVOICE_POPULATE);
    }

}

export default new InvoiceRepository();
