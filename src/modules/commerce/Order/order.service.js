import BaseService from "../../../shared/database/BaseService.js";
import orderRepository from "./order.repository.js";
import cartRepository from "../Cart/cart.repository.js";
import addressRepository from "../address/address.repository.js";
import inventoryRepository from "../../product/Inventory/inventory.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class OrderService extends BaseService {

    constructor() {
        super(orderRepository);
    }

    // Generate unique readable order number
    generateOrderNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `ORD-${timestamp}-${random}`;
    }

    // Create a new order from active user cart
    async createOrderFromCart(userId, { shippingAddressId, billingAddressId, paymentMethod = "COD", notes = "" }) {
        // Fetch user cart
        const cart = await cartRepository.findByUser(userId);

        if (!cart || cart.items.length === 0) {
            throw new AppError("Your cart is empty. Add items to cart before checking out.", 400);
        }

        // Fetch shipping address
        const shippingAddress = await addressRepository.findOne({
            _id: shippingAddressId,
            user: userId,
            deletedAt: null,
        });

        if (!shippingAddress) {
            throw new AppError("Invalid shipping address.", 404);
        }

        // Fetch billing address (defaults to shipping address if omitted)
        let billingAddress = shippingAddress;

        if (billingAddressId && billingAddressId.toString() !== shippingAddressId.toString()) {
            billingAddress = await addressRepository.findOne({
                _id: billingAddressId,
                user: userId,
                deletedAt: null,
            });

            if (!billingAddress) {
                throw new AppError("Invalid billing address.", 404);
            }
        }

        // Map cart items into snapshot order items
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.product;

            orderItems.push({
                product: product._id || product,
                variant: item.variant?._id || item.variant || null,
                name: product.name || "Product",
                sku: product.sku || item.variant?.sku || "SKU",
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                discount: item.discount || 0,
                tax: item.tax || 0,
                total: item.total,
            });

            // Restock/Deduct inventory
            const inventory = await inventoryRepository.findByProduct(product._id || product);

            if (inventory && inventory.trackInventory) {
                const currentStock = inventory.stock || 0;
                const newStock = Math.max(0, currentStock - item.quantity);
                await inventoryRepository.update(inventory._id, { stock: newStock });
            }
        }

        // Generate unique order number
        const orderNumber = this.generateOrderNumber();

        // Create order document
        const orderData = {
            orderNumber,
            user: userId,
            items: orderItems,
            shippingAddress: {
                fullName: shippingAddress.fullName,
                phone: shippingAddress.phone,
                email: shippingAddress.email || "",
                country: shippingAddress.country,
                state: shippingAddress.state,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2 || "",
                landmark: shippingAddress.landmark || "",
            },
            billingAddress: {
                fullName: billingAddress.fullName,
                phone: billingAddress.phone,
                email: billingAddress.email || "",
                country: billingAddress.country,
                state: billingAddress.state,
                city: billingAddress.city,
                postalCode: billingAddress.postalCode,
                addressLine1: billingAddress.addressLine1,
                addressLine2: billingAddress.addressLine2 || "",
                landmark: billingAddress.landmark || "",
            },
            subtotal: cart.subtotal,
            discount: cart.discount,
            tax: cart.tax,
            shippingFee: cart.shipping,
            grandTotal: cart.grandTotal,
            currency: cart.currency || "INR",
            coupon: cart.coupon
                ? {
                    code: cart.coupon.code,
                    discountType: cart.coupon.discountType,
                    discountValue: cart.coupon.discountValue,
                    discountAmount: cart.discount,
                }
                : { code: null, discountType: null, discountValue: 0, discountAmount: 0 },
            paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
            paymentMethod,
            orderStatus: "CONFIRMED",
            notes,
            createdBy: userId,
        };

        const newOrder = await this.repository.create(orderData);

        // Clear user cart after placing order
        await cartRepository.clearCart(userId);

        return newOrder;
    }

    // Get list of orders for a user
    async getUserOrders(userId) {
        return await this.repository.findByUser(userId);
    }

    // Get order details by ID for a user or admin
    async getOrderDetails(userId, orderId, isAdmin = false) {
        const query = isAdmin ? { _id: orderId, deletedAt: null } : { _id: orderId, user: userId, deletedAt: null };

        const order = await this.repository.findOne(query);

        if (!order) {
            throw new AppError("Order not found.", 404);
        }

        return order;
    }

    // Cancel order (User / Admin)
    async cancelOrder(userId, orderId, reason = "", isAdmin = false) {
        const order = await this.getOrderDetails(userId, orderId, isAdmin);

        if (["SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"].includes(order.orderStatus)) {
            throw new AppError(`Order cannot be cancelled at status '${order.orderStatus}'.`, 400);
        }

        // Restock inventory items
        for (const item of order.items) {
            const inventory = await inventoryRepository.findByProduct(item.product);

            if (inventory && inventory.trackInventory) {
                const newStock = (inventory.stock || 0) + item.quantity;
                await inventoryRepository.update(inventory._id, { stock: newStock });
            }
        }

        order.orderStatus = "CANCELLED";
        order.cancelledAt = new Date();
        order.cancellationReason = reason || "Cancelled by customer";
        order.updatedBy = userId;

        return await this.repository.update(order._id, order);
    }

    // Update order status (Admin)
    async updateOrderStatus(orderId, orderStatus, adminId) {
        const order = await this.repository.findById(orderId);

        if (!order) {
            throw new AppError("Order not found.", 404);
        }

        return await this.repository.updateOrderStatus(orderId, orderStatus, adminId);
    }

}

export default new OrderService();
