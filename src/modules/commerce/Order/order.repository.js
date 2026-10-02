import BaseRepository from "../../../shared/database/BaseRepository.js";
import Order from "./order.model.js";
import { ORDER_POPULATE } from "../../../shared/populate/order.populate.js";

class OrderRepository extends BaseRepository {

    constructor() {
        super(Order, ORDER_POPULATE);
    }

    // Find all orders for a specific user
    async findByUser(userId) {
        return await this.findAll({
            user: userId,
            deletedAt: null,
        }, null, { sort: { createdAt: -1 } });
    }

    // Find order by unique order number
    async findByOrderNumber(orderNumber) {
        return await this.findOne({
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
        ).populate(ORDER_POPULATE);
    }

    // Update payment status
    async updatePaymentStatus(orderId, paymentStatus) {
        return await this.model.findOneAndUpdate(
            { _id: orderId, deletedAt: null },
            { $set: { paymentStatus } },
            { new: true }
        ).populate(ORDER_POPULATE);
    }

}

export default new OrderRepository();
