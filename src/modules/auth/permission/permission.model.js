import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: [true, "Module is required"],
    },

    name: {
      type: String,
      required: [true, "Permission name is required"],
      trim: true,
      unique: true,
      maxlength: 100,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      // Example: Create Product
    },
    slug: {
      type: String,
      required: [true, "Permission slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 100,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "CREATE",
        "READ",
        "UPDATE",
        "DELETE",
        "MANAGE",
        "EXPORT",
        "IMPORT",
      ],
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    isSystem: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
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
    collection: "permissions",
  },
);

permissionSchema.index({ moduleId: 1, action: 1 });
permissionSchema.index({ status: 1 });

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;
