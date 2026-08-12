import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        prefix: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        sequence: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// `name` is declared unique on the schema path; avoid duplicate index declaration

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;