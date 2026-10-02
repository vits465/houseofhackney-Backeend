import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
    {
        media: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            required: true,
        },

        alt: {
            type: String,
            default: "",
            trim: true,
        },

        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

const productMediaSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },

        thumbnail: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },

        gallery: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Media",
            },
        ],

        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Media",
            },
        ],

        documents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Media",
            },
        ],

        featuredImageIndex: {
            type: Number,
            default: 0,
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

const ProductMedia = mongoose.model(
    "ProductMedia",
    productMediaSchema
);

export default ProductMedia;