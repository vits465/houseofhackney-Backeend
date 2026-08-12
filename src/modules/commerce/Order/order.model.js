import mongoose from "mongoose";

// Order item schema
const orderItemSchema = new mongoose.Schema(
    {
        // Product reference
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        // Variant reference (optional)
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Variant",
            default: null,
        },

        // Product name snapshot
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // SKU snapshot
        sku: {
            type: String,
            required: true,
            trim: true,
        },

        // Unit price snapshot
        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        // Quantity ordered
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        // Discount snapshot
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Tax snapshot
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Line total snapshot
        total: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: true }
);

// Snapshot address schema
const addressSnapshotSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, default: "" },
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String, default: "" },
        landmark: { type: String, default: "" },
    },
    { _id: false }
);

// Main order schema
const orderSchema = new mongoose.Schema(
    {
        // Unique readable order number
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Customer reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Ordered items list
        items: [orderItemSchema],

        // Shipping address snapshot
        shippingAddress: {
            type: addressSnapshotSchema,
            required: true,
        },

        // Billing address snapshot
        billingAddress: {
            type: addressSnapshotSchema,
            required: true,
        },

        // Order subtotal
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        // Total discount amount
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Total tax amount
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Shipping fee amount
        shippingFee: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Final grand total
        grandTotal: {
            type: Number,
            required: true,
            min: 0,
        },

        // Currency code
        currency: {
            type: String,
            default: "INR",
        },

        // Coupon snapshot
        coupon: {
            code: { type: String, default: null },
            discountType: { type: String, default: null },
            discountValue: { type: Number, default: 0 },
            discountAmount: { type: Number, default: 0 },
        },

        // Payment status
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
            default: "PENDING",
        },

        // Payment method
        paymentMethod: {
            type: String,
            enum: ["COD", "CARD", "UPI", "NETBANKING", "WALLET"],
            default: "COD",
        },

        // Overall order status
        orderStatus: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"],
            default: "PENDING",
        },

        // Order notes / instructions
        notes: {
            type: String,
            default: "",
            trim: true,
        },

        // Cancellation timestamp
        cancelledAt: {
            type: Date,
            default: null,
        },

        // Cancellation reason
        cancellationReason: {
            type: String,
            default: "",
        },

        // Audit tracking fields
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Database indexes
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
