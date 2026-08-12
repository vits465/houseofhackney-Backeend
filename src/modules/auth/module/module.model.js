import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    
    // Basic Information
        name: {
      type: String,
      required: [true, "Module name is required"],
      trim: true,
      unique: true,
      maxlength: 50,
    },

    slug: {
      type: String,
      required: [true, "Module slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

// Field definition
        d: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
    },

// Field definition
        n: {
      type: String,
      default: "",
    },

    route: {
      type: String,
      default: "",
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    displayInSidebar: {
      type: Boolean,
      default: true,
    },

// Field definition
        m: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },

// Field definition
        y: {
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
    collection: "modules",
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

moduleSchema.index({ parentModuleId: 1 });

moduleSchema.index({ status: 1 });

moduleSchema.index({ sortOrder: 1 });

moduleSchema.index({ displayInSidebar: 1 });

/*
|--------------------------------------------------------------------------
| Export Model
|--------------------------------------------------------------------------
*/

const Module = mongoose.model("Module", moduleSchema);

export default Module;