import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    extension: String,
    size: Number,
    width: Number,
    height: Number,
    format: String,
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    folder: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DELETED"],
      default: "ACTIVE",
    },
    deletedAt: Date,
    createdBy: {
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

mediaSchema.index({ folder: 1 });
mediaSchema.index({ status: 1 });

const Media = mongoose.model("Media", mediaSchema);

export default Media;