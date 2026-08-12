import orderService from "./order.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class OrderController {

    // Create a new order from cart
    async create(req, res, next) {
        try {
            const order = await orderService.createOrderFromCart(req.user._id, req.body);

            return new ApiResponse(
                res,
                201,
                "Order placed successfully.",
                order
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get user orders list
    async getUserOrders(req, res, next) {
        try {
            const orders = await orderService.getUserOrders(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Orders fetched successfully.",
                orders
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get order details
    async getOrderDetails(req, res, next) {
        try {
            const isAdmin = req.user.roles?.some(r => r.slug === "admin" || r.slug === "super_admin");
            const order = await orderService.getOrderDetails(req.user._id, req.params.id, isAdmin);

            return new ApiResponse(
                res,
                200,
                "Order details fetched successfully.",
                order
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Cancel order
    async cancelOrder(req, res, next) {
        try {
            const isAdmin = req.user.roles?.some(r => r.slug === "admin" || r.slug === "super_admin");
            const order = await orderService.cancelOrder(
                req.user._id,
                req.params.id,
                req.body.reason || "",
                isAdmin
            );

            return new ApiResponse(
                res,
                200,
                "Order cancelled successfully.",
                order
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Update order status (Admin)
    async updateStatus(req, res, next) {
        try {
            const order = await orderService.updateOrderStatus(
                req.params.id,
                req.body.status,
                req.user._id
            );

            return new ApiResponse(
                res,
                200,
                "Order status updated successfully.",
                order
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new OrderController();
