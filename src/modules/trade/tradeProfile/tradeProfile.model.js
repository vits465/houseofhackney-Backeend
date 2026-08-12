import mongoose from "mongoose";

const tradeProfileSchema = new mongoose.Schema(
    {
        // Customer user reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        // Associated trade company reference
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        // GST tax identification number
        gstNumber: {
            type: String,
            default: "",
            trim: true,
        },

        // VAT tax identification number
        vatNumber: {
            type: String,
            default: "",
            trim: true,
        },

        // Type of trade business
        businessType: {
            type: String,
            enum: [
                "INTERIOR_DESIGNER",
                "ARCHITECT",
                "HOTEL_HOSPITALITY",
                "RETAILER",
                "CONTRACTOR",
                "OTHER",
            ],
            default: "INTERIOR_DESIGNER",
        },

        // Business website URL
        website: {
            type: String,
            default: "",
            trim: true,
        },

        // Contact phone number
        phone: {
            type: String,
            required: true,
            trim: true,
        },

        // Trade application status
        status: {
            type: String,
            enum: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"],
            default: "PENDING",
        },

        // Assigned trade tier
        tier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TradeTier",
            default: null,
        },

        // Total approved credit limit
        creditLimit: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Currently used credit amount
        usedCredit: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Rejection reason notes
        rejectionReason: {
            type: String,
            default: "",
        },

        // Approval timestamp
        approvedAt: {
            type: Date,
            default: null,
        },

        // Admin user who approved application
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
tradeProfileSchema.index({ status: 1 });

const TradeProfile = mongoose.model("TradeProfile", tradeProfileSchema);

export default TradeProfile;
