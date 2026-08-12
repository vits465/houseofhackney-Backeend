import mongoose from "mongoose";

// Invoice line item schema
const invoiceItemSchema = new mongoose.Schema(
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

        // Item SKU snapshot
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

        // Quantity
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        // Line discount
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Line tax
        tax: {
            type: Number,
            default: 0,
            min: 0,
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

// Main invoice schema
const invoiceSchema = new mongoose.Schema(
    {
        // Unique invoice number
        invoiceNumber: {
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

        // Associated shipment reference (optional)
        shipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shipment",
            default: null,
        },

        // Associated payment reference (optional)
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null,
        },

        // Customer user reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Billing address snapshot
        billingAddress: {
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

        // Invoiced items list
        items: [invoiceItemSchema],

        // Subtotal before discounts and tax
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
        shipping: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Final grand total amount
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

        // Invoice status
        status: {
            type: String,
            enum: ["DRAFT", "ISSUED", "PAID", "CANCELLED"],
            default: "ISSUED",
        },

        // Issue timestamp
        issuedAt: {
            type: Date,
            default: Date.now,
        },

        // Paid timestamp
        paidAt: {
            type: Date,
            default: null,
        },

        // PDF download URL
        pdf: {
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
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
