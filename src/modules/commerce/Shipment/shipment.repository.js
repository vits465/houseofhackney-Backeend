import BaseRepository from "../../../shared/database/BaseRepository.js";
import Shipment from "./shipment.model.js";
import { SHIPMENT_POPULATE } from "../../../shared/populate/commerce.populate.js";

class ShipmentRepository extends BaseRepository {

    constructor() {
        super(Shipment, SHIPMENT_POPULATE);
    }

    // Find shipment by order ID
    async findByOrder(orderId) {
        return await this.findOne({
            order: orderId,
            deletedAt: null,
        });
    }

    // Find shipment by AWB tracking number
    async findByTracking(trackingNumber) {
        return await this.findOne({
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
        ).populate(SHIPMENT_POPULATE);
    }

}

export default new ShipmentRepository();
