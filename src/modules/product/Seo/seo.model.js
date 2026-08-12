import mongoose from "mongoose";

const seoSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },

        metaTitle: {
            type: String,
            trim: true,
            maxlength: 70,
            default: "",
        },

        metaDescription: {
            type: String,
            trim: true,
            maxlength: 160,
            default: "",
        },

        keywords: [
            {
                type: String,
                trim: true,
            },
        ],

        canonicalUrl: {
            type: String,
            trim: true,
            default: "",
        },

        robots: {
            type: String,
            enum: [
                "INDEX_FOLLOW",
                "NOINDEX_FOLLOW",
                "NOINDEX_NOFOLLOW",
            ],
            default: "INDEX_FOLLOW",
        },

        ogImage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },

        deletedAt: {
            type: Date,
            default: null,
        },

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
    }
);

const ProductSEO = mongoose.model(
    "ProductSEO",
    seoSchema
);

export default ProductSEO;