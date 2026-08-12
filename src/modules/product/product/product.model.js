import mongoose from "mongoose";

import {
    PRODUCT_STATUS,
    PRODUCT_VISIBILITY,
    PRODUCT_TYPES,
} from "../../../shared/constants/product.constants.js";

const productSchema = new mongoose.Schema(
    {
        // Basic information
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 250,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        barcode: {
            type: String,
            default: "",
            trim: true,
        },

        productType: {
            type: String,
            enum: Object.values(PRODUCT_TYPES),
            required: true,
        },

        shortDescription: {
            type: String,
            default: "",
            maxlength: 500,
        },

        description: {
            type: String,
            default: "",
        },

        // Master relations
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            default: null,
        },

        collection: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection",
            default: null,
        },

        designer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Designer",
            default: null,
        },

        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            default: null,
        },

        colours: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Colour",
            },
        ],

        patterns: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Pattern",
            },
        ],

        themes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Theme",
            },
        ],

        styles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Style",
            },
        ],

        rooms: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Room",
            },
        ],

        // Product flags
        isFeatured: {
            type: Boolean,
            default: false,
        },

        isBestSeller: {
            type: Boolean,
            default: false,
        },

        isNewArrival: {
            type: Boolean,
            default: false,
        },

        isTradeAvailable: {
            type: Boolean,
            default: false,
        },

        isCustomizable: {
            type: Boolean,
            default: false,
        },

        // Search keywords
        searchKeywords: [
            {
                type: String,
                trim: true,
            },
        ],

        // Publication status
        status: {
            type: String,
            enum: Object.values(PRODUCT_STATUS),
            default: PRODUCT_STATUS.DRAFT,
        },

        visibility: {
            type: String,
            enum: Object.values(PRODUCT_VISIBILITY),
            default: PRODUCT_VISIBILITY.PUBLIC,
        },

        publishedAt: Date,

        publishedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Soft delete timestamp
        deletedAt: {
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
    },
    {
        timestamps: true,
        versionKey: false,
        suppressReservedKeysWarning: true,
    }
);

// Indexes
productSchema.index({ barcode: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ collection: 1 });
productSchema.index({ designer: 1 });
productSchema.index({ material: 1 });
productSchema.index({ status: 1 });
productSchema.index({ visibility: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;