import { Router } from "express";

import { authRoutes } from "../modules/auth/index.js";
import { userRoutes } from "../modules/user/index.js";
import roleRoutes from "../modules/auth/role/index.js";
import permissionRoutes from "../modules/auth/permission/index.js";
import moduleRoutes from "../modules/auth/module/index.js";
import { categoryRoutes } from "../modules/catalog/Category/index.js";
import { brandRoutes } from "../modules/catalog/Brand/index.js";
import { productRoutes } from "../modules/product/product/index.js";
import { pricingRoutes } from "../modules/product/Pricing/index.js";
import { productMediaRoutes } from "../modules/product/product-media/index.js";
import { variantRoutes } from "../modules/product/Variant/index.js";
import { mediaRoutes } from "../modules/media/index.js";
import { counterRoutes } from "../modules/counter/index.js";
import "../modules/trade/tradeProfile/index.js";
import { inventoryRoutes } from "../modules/product/Inventory/index.js";
import { attributeRoutes } from "../modules/product/attribute/index.js";
import { filterRoutes } from "../modules/product/filter/index.js";
import { specificationRoutes } from "../modules/product/specification/index.js";
import { seoRoutes } from "../modules/product/Seo/index.js";
import { relatedRoutes } from "../modules/product/related/index.js";
import { reviewRoutes } from "../modules/product/review/index.js";
import { wishlistRoutes } from "../modules/commerce/Wishlist/index.js";
import { cartRoutes } from "../modules/commerce/Cart/index.js";
import { addressRoutes } from "../modules/commerce/address/index.js";
import { couponRoutes } from "../modules/commerce/Coupon/index.js";
import { orderRoutes } from "../modules/commerce/Order/index.js";
import { paymentRoutes } from "../modules/commerce/Payment/index.js";
import { shipmentRoutes } from "../modules/commerce/Shipment/index.js";
import { invoiceRoutes } from "../modules/commerce/invoice/index.js";
import { tradeProfileRoutes } from "../modules/trade/tradeProfile/index.js";
import { companyRoutes } from "../modules/trade/Company/index.js";
import { tradeTierRoutes } from "../modules/trade/tradeTier/index.js";
import { tradePricingRoutes } from "../modules/trade/tradePricing/index.js";
import { quotationRoutes } from "../modules/trade/quotation/index.js";
import { creditLimitRoutes } from "../modules/trade/creditLimit/index.js";

const router = Router();

// Authentication and user routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/modules", moduleRoutes);

// Catalog routes
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);

// Product sub-resource routes
router.use("/products", productRoutes);
router.use("/products/:productId/pricing", pricingRoutes);
router.use("/products/:productId/media", productMediaRoutes);
router.use("/products/:productId/specifications", specificationRoutes);
router.use("/products/:productId/seo", seoRoutes);
router.use("/products/:productId/related", relatedRoutes);
router.use("/products/:productId/reviews", reviewRoutes);

// Global product sub-module routes
router.use("/reviews", reviewRoutes);
router.use("/variants", variantRoutes);
router.use("/inventories", inventoryRoutes);
router.use("/attributes", attributeRoutes);
router.use("/filters", filterRoutes);

// Commerce routes
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);
router.use("/addresses", addressRoutes);
router.use("/coupons", couponRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/shipments", shipmentRoutes);
router.use("/invoices", invoiceRoutes);

// B2B Trade routes
router.use("/trade/profiles", tradeProfileRoutes);
router.use("/trade/companies", companyRoutes);
router.use("/trade/tiers", tradeTierRoutes);
router.use("/trade/pricing", tradePricingRoutes);
router.use("/trade/quotations", quotationRoutes);
router.use("/trade/credits", creditLimitRoutes);

// Media and utility routes
router.use("/media", mediaRoutes);
router.use("/counter", counterRoutes);

export default router;
