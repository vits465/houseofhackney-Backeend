import shipmentService from "./shipment.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class ShipmentController {

    // Create a new shipment (Admin)
    async create(req, res, next) {
        try {
            const shipment = await shipmentService.createShipment(req.user._id, req.body);

            return new ApiResponse(
                res,
                201,
                "Shipment created successfully.",
                shipment
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Update shipment tracking status (Admin)
    async updateStatus(req, res, next) {
        try {
            const shipment = await shipmentService.updateStatus(
                req.user._id,
                req.params.id,
                req.body
            );

            return new ApiResponse(
                res,
                200,
                "Shipment status updated successfully.",
                shipment
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get shipment details for a specific order
    async getByOrder(req, res, next) {
        try {
            const isAdmin = req.user.roles?.some(r => r.slug === "admin" || r.slug === "super_admin");
            const shipment = await shipmentService.getShipmentByOrder(
                req.user._id,
                req.params.orderId,
                isAdmin
            );

            return new ApiResponse(
                res,
                200,
                "Shipment details fetched successfully.",
                shipment
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Track shipment by public AWB tracking number
    async track(req, res, next) {
        try {
            const tracking = await shipmentService.trackByNumber(req.params.trackingNumber);

            return new ApiResponse(
                res,
                200,
                "Tracking information fetched successfully.",
                tracking
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get user shipments list
    async getUserShipments(req, res, next) {
        try {
            const isAdmin = req.user.roles?.some(r => r.slug === "admin" || r.slug === "super_admin" || r.slug === "super-admin");
            const shipments = isAdmin
                ? await shipmentService.repository.findAll({})
                : await shipmentService.getUserShipments(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Shipments fetched successfully.",
                shipments
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new ShipmentController();
