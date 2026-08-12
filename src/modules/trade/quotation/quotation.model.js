import mongoose from "mongoose";

// Quotation item schema
const quotationItemSchema = new mongoose.Schema(
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

        // Item name snapshot
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // Standard unit price
        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        // Admin negotiated price per unit (optional)
        negotiatedPrice: {
            type: Number,
            default: null,
            min: 0,
        },

        // Quantity requested
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        // Line total
        total: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: true }
);

// Main quotation schema
const quotationSchema = new mongoose.Schema(
    {
        // Unique quote reference number
        quoteNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Requesting trade user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Associated company reference
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        // Quoted items list
        items: [quotationItemSchema],

        // Subtotal before negotiation
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        // Negotiated subtotal by admin (optional)
        negotiatedSubtotal: {
            type: Number,
            default: null,
            min: 0,
        },

        // Discount amount
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Tax amount
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Estimated shipping amount
        shipping: {
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

        // Quotation lifecycle status
        status: {
            type: String,
            enum: ["DRAFT", "REQUESTED", "NEGOTIATING", "APPROVED", "DECLINED", "CONVERTED"],
            default: "REQUESTED",
        },

        // Notes from admin / sales rep
        adminNotes: {
            type: String,
            default: "",
            trim: true,
        },

        // Special instructions from customer
        customerNotes: {
            type: String,
            default: "",
            trim: true,
        },

        // Quote expiry date
        expiresAt: {
            type: Date,
            default: null,
        },

        // Reference to converted B2B order
        convertedOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
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
quotationSchema.index({ status: 1 });
quotationSchema.index({ createdAt: -1 });

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;
