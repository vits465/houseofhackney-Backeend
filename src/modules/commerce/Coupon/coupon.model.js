import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        // Unique coupon code
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Coupon description
        description: {
            type: String,
            default: "",
            trim: true,
        },

        // Type of discount
        discountType: {
            type: String,
            enum: ["PERCENTAGE", "FLAT"],
            required: true,
        },

        // Discount value
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

        // Target audience / applicability scope
        couponTarget: {
            type: String,
            enum: ["ALL", "CATEGORY", "PRODUCT", "BRAND", "USER", "FIRST_ORDER"],
            default: "ALL",
        },

        // Applicable category IDs
        applicableCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],

        // Applicable product IDs
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        // Applicable brand IDs
        applicableBrands: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Brand",
            },
        ],

        // Applicable user IDs
        applicableUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Minimum order subtotal required
        minOrderAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Maximum discount cap (for percentage coupons)
        maxDiscountAmount: {
            type: Number,
            default: null,
            min: 0,
        },

        // Total usage limit across system
        usageLimit: {
            type: Number,
            default: null,
            min: 1,
        },

        // Number of times used so far
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Per user usage limit
        perUserLimit: {
            type: Number,
            default: 1,
            min: 1,
        },

        // Validity start date
        startDate: {
            type: Date,
            default: Date.now,
        },

        // Validity expiry date
        expiryDate: {
            type: Date,
            required: true,
        },

        // Coupon status
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
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
couponSchema.index({ status: 1 });
couponSchema.index({ startDate: 1, expiryDate: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
