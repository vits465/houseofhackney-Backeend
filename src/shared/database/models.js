// Central Model Registry - ensures all Mongoose schemas are registered for populate references
import "../../modules/media/media.model.js";

// Auth & Users
import "../../modules/auth/module/module.model.js";
import "../../modules/auth/permission/permission.model.js";
import "../../modules/auth/role/role.model.js";
import "../../modules/auth/session/session.model.js";
import "../../modules/auth/otp/otp.model.js";
import "../../modules/userToken/userToken.model.js";
import "../../modules/user/user.model.js";

// Catalog Taxonomy
import "../../modules/catalog/Category/category.model.js";
import "../../modules/catalog/Brand/brand.model.js";
import "../../modules/catalog/Collection/collection.model.js";
import "../../modules/catalog/Colour/color.model.js";
import "../../modules/catalog/Designer/designer.model.js";
import "../../modules/catalog/Material/material.model.js";
import "../../modules/catalog/Pattern/pattren.model.js";
import "../../modules/catalog/Room/room.model.js";
import "../../modules/catalog/Style/style.model.js";
import "../../modules/catalog/Theme/theme.model.js";

// Product & Submodules
import "../../modules/product/product/product.model.js";
import "../../modules/product/Pricing/pricing.model.js";
import "../../modules/product/product-media/productMedia.model.js";
import "../../modules/product/Variant/variant.model.js";
import "../../modules/product/Inventory/inventory.model.js";
import "../../modules/product/attribute/attribute.model.js";
import "../../modules/product/filter/filter.model.js";
import "../../modules/product/specification/specification.model.js";
import "../../modules/product/Seo/seo.model.js";
import "../../modules/product/related/related.model.js";
import "../../modules/product/review/review.model.js";

// Commerce
import "../../modules/commerce/Cart/cart.model.js";
import "../../modules/commerce/Wishlist/wishlist.model.js";
import "../../modules/commerce/Order/order.model.js";
import "../../modules/commerce/Payment/payment.model.js";
import "../../modules/commerce/Shipment/shipment.model.js";
import "../../modules/commerce/invoice/invoice.model.js";
import "../../modules/commerce/address/address.model.js";
import "../../modules/commerce/Coupon/coupon.model.js";

// Trade
import "../../modules/trade/tradeProfile/tradeProfile.model.js";
import "../../modules/trade/Company/company.model.js";
import "../../modules/trade/tradeTier/tradeTier.model.js";
import "../../modules/trade/tradePricing/tradePricing.model.js";
import "../../modules/trade/quotation/quotation.model.js";
import "../../modules/trade/creditLimit/creditLimit.model.js";

// Utility
import "../../modules/counter/counter.model.js";
