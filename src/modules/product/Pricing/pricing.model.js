import mongoose from "mongoose";
import { CURRENCIES } from "../../../shared/constants/currency.constants.js";
import { TAX_CLASSES } from "../../../shared/constants/tax.constant.js";

const pricingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    currency: {
      type: String,
      enum: Object.values(CURRENCIES),
      default: CURRENCIES.INR,
    },
    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    tradePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumAdvertisedPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxClass: {
      type: String,
      enum: Object.values(TAX_CLASSES),
      default: TAX_CLASSES.GST_18,
    },
    isActive: {
      type: Boolean,
      default: true,
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

pricingSchema.index({ currency: 1 });
pricingSchema.index({ isActive: 1 });

const ProductPricing = mongoose.model("ProductPricing", pricingSchema);

export default ProductPricing;