import BaseRepository from "../../../shared/database/BaseRepository.js";
import Payment from "./payment.model.js";

class PaymentRepository extends BaseRepository {

    constructor() {
        super(Payment);
    }

    // Find all payments for an order
    async findByOrder(orderId) {
        return await this.model.find({
            order: orderId,
            deletedAt: null,
        }).sort({ createdAt: -1 });
    }

    // Find payment by unique transaction ID
    async findByTransactionId(transactionId) {
        return await this.model.findOne({
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
        );
    }

}

export default new PaymentRepository();
