import mongoose from "mongoose";

const specificationItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: "Specification",
            trim: true,
        },

        value: {
            type: String,
            default: "Standard",
            trim: true,
        },

        unit: {
            type: String,
            default: "",
            trim: true,
        },

        group: {
            type: String,
            default: "General",
            trim: true,
        },

        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { _id: true }
);

const specificationSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },

        specifications: [specificationItemSchema],

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

const ProductSpecification = mongoose.model(
    "ProductSpecification",
    specificationSchema
);

export default ProductSpecification;
