import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        // Company legal name
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // Registered business address
        address: {
            street: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            postalCode: { type: String, default: "" },
            country: { type: String, default: "India" },
        },

        // Primary operating country
        country: {
            type: String,
            required: true,
            default: "India",
            trim: true,
        },

        // Official registration number
        registrationNumber: {
            type: String,
            default: "",
            trim: true,
        },

        // Tax identification number (GST / VAT)
        taxNumber: {
            type: String,
            default: "",
            trim: true,
        },

        // Company website URL
        website: {
            type: String,
            default: "",
            trim: true,
        },

        // Company logo image URL
        logo: {
            type: String,
            default: "",
            trim: true,
        },

        // Contact phone number
        phone: {
            type: String,
            default: "",
            trim: true,
        },

        // Contact email address
        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        // Company status
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

// Database indexes
companySchema.index({ name: 1 });
companySchema.index({ status: 1 });

const Company = mongoose.model("Company", companySchema);

export default Company;
