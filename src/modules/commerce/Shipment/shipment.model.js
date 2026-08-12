import mongoose from "mongoose";

// Tracking history event schema
const trackingHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            default: "",
        },
        comment: {
            type: String,
            default: "",
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

// Main shipment schema
const shipmentSchema = new mongoose.Schema(
    {
        // Unique shipment number
        shipmentNumber: {
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

        // Recipient user reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Courier / Logistics service name
        courierName: {
            type: String,
            required: true,
            trim: true,
        },

        // Tracking waybill / AWB number
        trackingNumber: {
            type: String,
            required: true,
            trim: true,
        },

        // External tracking URL
        trackingUrl: {
            type: String,
            default: "",
            trim: true,
        },

        // Overall shipment status
        status: {
            type: String,
            enum: [
                "PENDING",
                "DISPATCHED",
                "IN_TRANSIT",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "FAILED_ATTEMPT",
                "RETURNED",
            ],
            default: "PENDING",
        },

        // Dispatch timestamp
        shippedAt: {
            type: Date,
            default: null,
        },

        // Estimated delivery timestamp
        estimatedDelivery: {
            type: Date,
            default: null,
        },

        // Actual delivery timestamp
        deliveredAt: {
            type: Date,
            default: null,
        },

        // Destination address snapshot
        shippingAddress: {
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

        // Timeline of tracking status updates
        trackingHistory: [trackingHistorySchema],

        // Shipping notes
        notes: {
            type: String,
            default: "",
            trim: true,
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
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ createdAt: -1 });

const Shipment = mongoose.model("Shipment", shipmentSchema);

export default Shipment;
