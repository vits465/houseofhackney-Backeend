import BaseRepository from "../../../shared/database/BaseRepository.js";
import Order from "./order.model.js";

class OrderRepository extends BaseRepository {

    constructor() {
        super(Order);
    }

    // Find all orders for a specific user
    async findByUser(userId) {
        return await this.model.find({
            user: userId,
            deletedAt: null,
        }).sort({ createdAt: -1 });
    }

    // Find order by unique order number
    async findByOrderNumber(orderNumber) {
        return await this.model.findOne({
            orderNumber: orderNumber.trim().toUpperCase(),
            deletedAt: null,
        });
    }

    // Update overall order status
    async updateOrderStatus(orderId, orderStatus, adminId) {
        return await this.model.findOneAndUpdate(
            { _id: orderId, deletedAt: null },
            {
                $set: {
                    orderStatus,
                    updatedBy: adminId,
                },
            },
            { new: true }
        );
    }

    // Update payment status
    async updatePaymentStatus(orderId, paymentStatus) {
        return await this.model.findOneAndUpdate(
            { _id: orderId, deletedAt: null },
            { $set: { paymentStatus } },
            { new: true }
        );
    }

}

export default new OrderRepository();
