import BaseRepository from "../../../shared/database/BaseRepository.js";
import Shipment from "./shipment.model.js";

class ShipmentRepository extends BaseRepository {

    constructor() {
        super(Shipment);
    }

    // Find shipment by order ID
    async findByOrder(orderId) {
        return await this.model.findOne({
            order: orderId,
            deletedAt: null,
        }).populate("order", "orderNumber orderStatus grandTotal");
    }

    // Find shipment by AWB tracking number
    async findByTracking(trackingNumber) {
        return await this.model.findOne({
            trackingNumber: trackingNumber.trim(),
            deletedAt: null,
        });
    }

    // Push new status update to tracking history
    async addTrackingStatus(shipmentId, statusEvent, mainStatus = null, extraData = {}) {
        const updatePayload = {
            $push: { trackingHistory: statusEvent },
            $set: {
                ...extraData,
            },
        };

        if (mainStatus) {
            updatePayload.$set.status = mainStatus;
        }

        return await this.model.findOneAndUpdate(
            { _id: shipmentId, deletedAt: null },
            updatePayload,
            { new: true }
        );
    }

}

export default new ShipmentRepository();
