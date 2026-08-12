import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // Unique transaction identifier
        transactionId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Associated order reference
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },

        // Payer user reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Payment gateway provider
        provider: {
            type: String,
            enum: ["STRIPE", "RAZORPAY", "PAYPAL", "COD"],
            default: "COD",
        },

        // Payment method instrument
        paymentMethod: {
            type: String,
            enum: ["CARD", "UPI", "NETBANKING", "WALLET", "COD"],
            default: "COD",
        },

        // Payment amount
        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Currency code
        currency: {
            type: String,
            default: "INR",
        },

        // Payment status
        status: {
            type: String,
            enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED"],
            default: "PENDING",
        },

        // Payment gateway transaction ID
        gatewayTransactionId: {
            type: String,
            default: "",
            trim: true,
        },

        // Raw gateway payload response
        gatewayResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        // Failure reason description
        failureReason: {
            type: String,
            default: "",
        },

        // Refund identifier
        refundId: {
            type: String,
            default: "",
        },

        // Refunded amount
        refundAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Refund timestamp
        refundedAt: {
            type: Date,
            default: null,
        },

        // Payment timestamp
        paidAt: {
            type: Date,
            default: null,
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
paymentSchema.index({ status: 1 });
paymentSchema.index({ provider: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
