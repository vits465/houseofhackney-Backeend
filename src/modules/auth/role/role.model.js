  import mongoose from "mongoose";

  const roleSchema = new mongoose.Schema(
    {
      
      // Basic Information
        name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 50,
      },

      displayName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        maxlength: 100,
      },

      description: {
        type: String,
        default: "",
        maxlength: 500,
      },

// Permissions
        permissions: [
        {
          permission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission",
            required: true,
          },

          grantedAt: {
            type: Date,
            default: Date.now,
          },

          grantedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
          },
        },
      ],

// Role Settings
        priority: {
        type: Number,
        default: 100,
        min: 1,
      },

      level: {
        type: Number,
        default: 1,
        min: 1,
      },

      isDefault: {
        type: Boolean,
        default: false,
      },

      isSystem: {
        type: Boolean,
        default: false,
      },

// Field definition
        n: {
        type: Boolean,
        default: false,
      },

      canLoginWebsite: {
        type: Boolean,
        default: true,
      },

// Field definition
        s: {
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
      collection: "roles",
    }
  );

  roleSchema.index({ priority: 1 });
  roleSchema.index({ status: 1 });

  const Role = mongoose.model("Role", roleSchema);

  export default Role;