import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        // User reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Address type classification
        type: {
            type: String,
            enum: ["HOME", "OFFICE", "SHIPPING", "BILLING"],
            default: "SHIPPING",
        },

        // Contact person full name
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        // Company name (optional)
        company: {
            type: String,
            default: "",
            trim: true,
        },

        // Contact phone number
        phone: {
            type: String,
            required: true,
            trim: true,
        },

        // Contact email address
        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        // Country name
        country: {
            type: String,
            required: true,
            default: "India",
            trim: true,
        },

        // State or region
        state: {
            type: String,
            required: true,
            trim: true,
        },

        // City name
        city: {
            type: String,
            required: true,
            trim: true,
        },

        // Postal or PIN code
        postalCode: {
            type: String,
            required: true,
            trim: true,
        },

        // Street address line 1
        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },

        // Street address line 2 (optional)
        addressLine2: {
            type: String,
            default: "",
            trim: true,
        },

        // Nearby landmark (optional)
        landmark: {
            type: String,
            default: "",
            trim: true,
        },

        // Geo-location latitude
        latitude: {
            type: Number,
            default: null,
        },

        // Geo-location longitude
        longitude: {
            type: Number,
            default: null,
        },

        // Default address indicator
        isDefault: {
            type: Boolean,
            default: false,
        },

        // Active status
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
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

const Address = mongoose.model("Address", addressSchema);

export default Address;
