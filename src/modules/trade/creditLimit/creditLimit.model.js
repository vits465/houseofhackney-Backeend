import mongoose from "mongoose";

const creditLimitSchema = new mongoose.Schema(
    {
        // Target company reference
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            unique: true,
            index: true,
        },

        // Primary account user reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Total sanctioned credit limit amount
        totalCredit: {
            type: Number,
            required: true,
            min: 0,
        },

        // Currently utilized credit amount
        usedCredit: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Remaining available credit balance
        availableCredit: {
            type: Number,
            required: true,
            min: 0,
        },

        // Pending unbilled credit orders
        pendingCredit: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Credit payment terms
        paymentTerm: {
            type: String,
            enum: ["IMMEDIATE", "NET_15", "NET_30", "NET_45", "NET_60"],
            default: "NET_30",
        },

        // Credit status
        status: {
            type: String,
            enum: ["ACTIVE", "SUSPENDED", "EXCEEDED"],
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
creditLimitSchema.index({ status: 1 });

const CreditLimit = mongoose.model("CreditLimit", creditLimitSchema);

export default CreditLimit;
