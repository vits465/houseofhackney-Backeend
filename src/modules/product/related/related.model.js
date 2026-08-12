import mongoose from "mongoose";

const relatedItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        relationType: {
            type: String,
            enum: [
                "RELATED",
                "UPSELL",
                "CROSS_SELL",
                "SIMILAR",
            ],
            default: "RELATED",
        },

        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

const relatedSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },

        relatedProducts: [relatedItemSchema],

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

const ProductRelated = mongoose.model(
    "ProductRelated",
    relatedSchema
);

export default ProductRelated;