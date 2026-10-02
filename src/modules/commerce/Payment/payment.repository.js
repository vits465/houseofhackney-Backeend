import BaseRepository from "../../../shared/database/BaseRepository.js";
import Payment from "./payment.model.js";
import { PAYMENT_POPULATE } from "../../../shared/populate/commerce.populate.js";

class PaymentRepository extends BaseRepository {

    constructor() {
        super(Payment, PAYMENT_POPULATE);
    }

    // Find all payments for an order
    async findByOrder(orderId) {
        return await this.findAll({
            order: orderId,
            deletedAt: null,
        }, null, { sort: { createdAt: -1 } });
    }

    // Find payment by unique transaction ID
    async findByTransactionId(transactionId) {
        return await this.findOne({
            transactionId: transactionId.trim().toUpperCase(),
            deletedAt: null,
        });
    }

    // Update payment status
    async updatePaymentStatus(paymentId, status, extraData = {}) {
        return await this.model.findOneAndUpdate(
            { _id: paymentId, deletedAt: null },
            {
                $set: {
                    status,
                    ...extraData,
                },
            },
            { new: true }
        ).populate(PAYMENT_POPULATE);
    }

}

export default new PaymentRepository();
