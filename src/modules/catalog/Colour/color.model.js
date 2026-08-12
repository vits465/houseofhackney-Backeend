import mongoose from "mongoose";

const colourSchema = new mongoose.Schema(
  {
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
    colorHex: {
      type: String,
      default: "#000000",
      trim: true,
    },
    code: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Colour = mongoose.model("Colour", colourSchema);
export default Colour;
