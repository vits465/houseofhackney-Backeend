import mongoose from "mongoose";

const tradeTierSchema = new mongoose.Schema(
    {
        // Tier name identifier
        name: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM"],
        },

        // Tier description
        description: {
            type: String,
            default: "",
            trim: true,
        },

        // Base discount percentage offered to this tier
        discountPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 0,
        },

        // Default credit limit amount
        creditLimit: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Payment terms
        paymentTerm: {
            type: String,
            enum: ["IMMEDIATE", "NET_15", "NET_30", "NET_45", "NET_60"],
            default: "NET_30",
        },

        // Free shipping privilege flag
        freeShipping: {
            type: Boolean,
            default: false,
        },

        // Priority customer support flag
        prioritySupport: {
            type: Boolean,
            default: false,
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

// Database indexes
tradeTierSchema.index({ status: 1 });

const TradeTier = mongoose.model("TradeTier", tradeTierSchema);

export default TradeTier;
