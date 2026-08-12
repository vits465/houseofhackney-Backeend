import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
    {
        
        // Basic information
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            maxlength: 2000,
        },

        shortDescription: {
            type: String,
            default: "",
            maxlength: 300,
        },

// Field definition
        o: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },

        banner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },

        image: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },

// Field definition
        e: {
            type: String,
            default: "",
        },

        country: {
            type: String,
            default: "",
        },

        establishedYear: Number,

// Field definition
        o: {

            metaTitle: String,

            metaDescription: String,

            metaKeywords: [String],

        },

// Field definition
        r: {

            type: Number,

            default: 0,

        },

        isFeatured: {

            type: Boolean,

            default: false,

        },

        status: {

            type: String,

            enum: ["ACTIVE", "INACTIVE"],

            default: "ACTIVE",

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
    }
);

// `slug` has unique:true on the schema path; avoid duplicate index declaration
brandSchema.index({ status: 1 });
brandSchema.index({ isFeatured: 1 });
brandSchema.index({ sortOrder: 1 });

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;