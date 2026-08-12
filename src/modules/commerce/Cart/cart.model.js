import mongoose from "mongoose";

// Cart item schema
const cartItemSchema = new mongoose.Schema(
    {
        // Product reference
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        // Variant reference
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Variant",
            default: null,
        },

        // Item quantity
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },

        // Price snapshot
        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        // Item discount
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Item tax
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Item line total
        total: {
            type: Number,
            required: true,
            min: 0,
        },

        // Timestamp when item was added
        addedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: true,
    }
);

// Applied coupon schema
const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        discountType: {
            type: String,
            enum: ["PERCENTAGE", "FIXED"],
            default: "PERCENTAGE",
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

// Main cart schema
const cartSchema = new mongoose.Schema(
    {
        // Owner user reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        // Cart items list
        items: [cartItemSchema],

        // Subtotal before discounts
        subtotal: {
            type: Number,
            default: 0,
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

        // Shipping fee
        shipping: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Final grand total
        grandTotal: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Currency code
        currency: {
            type: String,
            default: "INR",
        },

        // Applied coupon details
        coupon: {
            type: couponSchema,
            default: null,
        },

        // Cart status
        status: {
            type: String,
            enum: ["ACTIVE", "ABANDONED", "CONVERTED"],
            default: "ACTIVE",
        },

        // Cart expiration timestamp
        expiresAt: {
            type: Date,
            default: null,
        },

        // Audit fields
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

const Cart = mongoose.model(
    "Cart",
    cartSchema
);

export default Cart;
