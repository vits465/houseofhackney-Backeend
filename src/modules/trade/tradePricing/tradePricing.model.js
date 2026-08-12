import mongoose from "mongoose";

const tradePricingSchema = new mongoose.Schema(
    {
        // Target product reference
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        // Target variant reference (optional)
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Variant",
            default: null,
        },

        // Target trade tier reference
        tradeTier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TradeTier",
            required: true,
            index: true,
        },

        // Tier specific trade price
        price: {
            type: Number,
            required: true,
            min: 0,
        },

        // Minimum order quantity for tier pricing
        minQuantity: {
            type: Number,
            default: 1,
            min: 1,
        },

        // Status indicator
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE",
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

// Database compound index
tradePricingSchema.index({ product: 1, tradeTier: 1 }, { unique: true });

const TradePricing = mongoose.model("TradePricing", tradePricingSchema);

export default TradePricing;
