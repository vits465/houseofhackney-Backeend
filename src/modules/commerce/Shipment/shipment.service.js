import BaseService from "../../../shared/database/BaseService.js";
import shipmentRepository from "./shipment.repository.js";
import orderRepository from "../Order/order.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class ShipmentService extends BaseService {

    constructor() {
        super(shipmentRepository);
    }

    // Generate unique shipment number
    generateShipmentNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `SHP-${timestamp}-${random}`;
    }

    // Create a new shipment for an order (Admin)
    async createShipment(adminId, { orderId, courierName, trackingNumber, trackingUrl = "", estimatedDelivery = null, notes = "" }) {
        const order = await orderRepository.findById(orderId);

        if (!order || order.deletedAt) {
            throw new AppError("Order not found.", 404);
        }

        if (order.orderStatus === "CANCELLED") {
            throw new AppError("Cannot create shipment for a cancelled order.", 400);
        }

        const existingShipment = await this.repository.findByOrder(orderId);

        if (existingShipment) {
            throw new AppError("Shipment has already been generated for this order.", 409);
        }

        const shipmentNumber = this.generateShipmentNumber();
        const shippedAt = new Date();

        const initialEvent = {
            status: "DISPATCHED",
            location: "Fulfillment Center",
            comment: `Shipment created via ${courierName}. AWB: ${trackingNumber}`,
            timestamp: shippedAt,
        };

        const shipmentData = {
            shipmentNumber,
            order: order._id,
            user: order.user,
            courierName: courierName.trim(),
            trackingNumber: trackingNumber.trim(),
            trackingUrl: trackingUrl.trim(),
            status: "DISPATCHED",
            shippedAt,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
            shippingAddress: order.shippingAddress,
            trackingHistory: [initialEvent],
            notes,
            createdBy: adminId,
        };

        const shipment = await this.repository.create(shipmentData);

        // Update overall order status to SHIPPED
        await orderRepository.updateOrderStatus(order._id, "SHIPPED", adminId);

        return shipment;
    }

    // Update shipment tracking status (Admin)
    async updateStatus(adminId, shipmentId, { status, location = "", comment = "" }) {
        const shipment = await this.repository.findById(shipmentId);

        if (!shipment || shipment.deletedAt) {
            throw new AppError("Shipment record not found.", 404);
        }

        const statusEvent = {
            status: status.toUpperCase(),
            location: location.trim(),
            comment: comment.trim(),
            timestamp: new Date(),
        };

        const extraData = { updatedBy: adminId };

        if (status.toUpperCase() === "DELIVERED") {
            extraData.deliveredAt = new Date();
        }

        const updatedShipment = await this.repository.addTrackingStatus(
            shipment._id,
            statusEvent,
            status.toUpperCase(),
            extraData
        );

        // Update order status corresponding to delivery events
        if (status.toUpperCase() === "DELIVERED") {
            await orderRepository.updateOrderStatus(shipment.order, "DELIVERED", adminId);
        } else if (status.toUpperCase() === "IN_TRANSIT" || status.toUpperCase() === "OUT_FOR_DELIVERY") {
            await orderRepository.updateOrderStatus(shipment.order, "SHIPPED", adminId);
        }

        return updatedShipment;
    }

    // Get shipment by order ID
    async getShipmentByOrder(userId, orderId, isAdmin = false) {
        const shipment = await this.repository.findByOrder(orderId);

        if (!shipment) {
            throw new AppError("Shipment details not found for this order.", 404);
        }

        if (!isAdmin && shipment.user.toString() !== userId.toString()) {
            throw new AppError("Unauthorized.", 403);
        }

        return shipment;
    }

    // Track shipment by public AWB tracking number
    async trackByNumber(trackingNumber) {
        const shipment = await this.repository.findByTracking(trackingNumber);

        if (!shipment) {
            throw new AppError("No shipment found for the provided tracking number.", 404);
        }

        return {
            shipmentNumber: shipment.shipmentNumber,
            courierName: shipment.courierName,
            trackingNumber: shipment.trackingNumber,
            trackingUrl: shipment.trackingUrl,
            status: shipment.status,
            shippedAt: shipment.shippedAt,
            estimatedDelivery: shipment.estimatedDelivery,
            deliveredAt: shipment.deliveredAt,
            trackingHistory: shipment.trackingHistory,
        };
    }

    // Get user shipments list
    async getUserShipments(userId) {
        return await this.repository.findAll({
            user: userId,
            deletedAt: null,
        });
    }

}

export default new ShipmentService();
