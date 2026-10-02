import mongoose from "mongoose";
import slugify from "../../../shared/helpers/slugify.js";

const attributeValueSchema = new mongoose.Schema(
  {
    label: {
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
    },
    colorCode: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { _id: true }
);

attributeValueSchema.pre("validate", function () {
  if (!this.slug && this.label) {
    this.slug = slugify(this.label);
  }
});

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["TEXT", "NUMBER", "SELECT", "MULTISELECT", "BOOLEAN", "COLOR", "IMAGE"],
      default: "SELECT",
    },
    isVariant: {
      type: Boolean,
      default: false,
    },
    isFilterable: {
      type: Boolean,
      default: false,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    values: [attributeValueSchema],
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
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
  }
);

attributeSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

attributeSchema.index({ isVariant: 1 });
attributeSchema.index({ isFilterable: 1 });

const Attribute = mongoose.model("Attribute", attributeSchema);

export default Attribute;