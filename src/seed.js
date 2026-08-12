import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Import all 43 Models
import User from "./modules/user/user.model.js";
import Role from "./modules/auth/role/role.model.js";
import Permission from "./modules/auth/permission/permission.model.js";
import Module from "./modules/auth/module/module.model.js";
import Session from "./modules/auth/session/session.model.js";
import Otp from "./modules/auth/otp/otp.model.js";

import Category from "./modules/catalog/Category/category.model.js";
import Brand from "./modules/catalog/Brand/brand.model.js";
import Collection from "./modules/catalog/Collection/collection.model.js";
import Colour from "./modules/catalog/Colour/color.model.js";
import Designer from "./modules/catalog/Designer/designer.model.js";
import Material from "./modules/catalog/Material/material.model.js";
import Pattern from "./modules/catalog/Pattern/pattren.model.js";
import Theme from "./modules/catalog/Theme/theme.model.js";
import Style from "./modules/catalog/Style/style.model.js";
import Room from "./modules/catalog/Room/room.model.js";

import Product from "./modules/product/product/product.model.js";
import ProductPricing from "./modules/product/Pricing/pricing.model.js";
import ProductMedia from "./modules/product/product-media/productMedia.model.js";
import Media from "./modules/media/media.model.js";
import Variant from "./modules/product/Variant/variant.model.js";
import Inventory from "./modules/product/Inventory/inventory.model.js";
import Attribute from "./modules/product/attribute/attribute.model.js";
import Specification from "./modules/product/specification/specification.model.js";
import Seo from "./modules/product/Seo/seo.model.js";
import Related from "./modules/product/related/related.model.js";
import Review from "./modules/product/review/review.model.js";
import FilterGroup from "./modules/product/filter/filter.model.js";

import Wishlist from "./modules/commerce/Wishlist/wishlist.model.js";
import Cart from "./modules/commerce/Cart/cart.model.js";
import Address from "./modules/commerce/address/address.model.js";
import Coupon from "./modules/commerce/Coupon/coupon.model.js";
import Order from "./modules/commerce/Order/order.model.js";
import Payment from "./modules/commerce/Payment/payment.model.js";
import Shipment from "./modules/commerce/Shipment/shipment.model.js";
import Invoice from "./modules/commerce/invoice/invoice.model.js";

import TradeProfile from "./modules/trade/tradeProfile/tradeProfile.model.js";
import Company from "./modules/trade/Company/company.model.js";
import TradeTier from "./modules/trade/tradeTier/tradeTier.model.js";
import TradePricing from "./modules/trade/tradePricing/tradePricing.model.js";
import Quotation from "./modules/trade/quotation/quotation.model.js";
import CreditLimit from "./modules/trade/creditLimit/creditLimit.model.js";
import Counter from "./modules/counter/counter.model.js";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "tysd8i65";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function titleCase(str) {
  return str
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

async function seedMasterDatabase() {
  console.log("🌱 Starting House of Hackney Ultimate Master Database Seeder (All 43 Collections)...");
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/house_of_hackney");

  // Clean obsolete indexes
  await Category.collection.dropIndexes().catch(() => {});
  await Product.collection.dropIndexes().catch(() => {});
  await Inventory.collection.dropIndexes().catch(() => {});
  await ProductPricing.collection.dropIndexes().catch(() => {});
  await Variant.collection.dropIndexes().catch(() => {});
  await Media.collection.dropIndexes().catch(() => {});

  // RBAC Modules, Permissions & Roles
  console.log("-> Seeding RBAC Modules, Permissions & Roles...");
  const catalogModule = await Module.findOneAndUpdate(
    { slug: "catalog-management" },
    {
      name: "Catalog Management",
      slug: "catalog-management",
      description: "Category, Brand & Product management",
      icon: "shopping-bag",
      route: "/admin/catalog",
    },
    { upsert: true, returnDocument: "after" }
  );

  const readPerm = await Permission.findOneAndUpdate(
    { slug: "product-read" },
    {
      moduleId: catalogModule._id,
      name: "PRODUCT_READ",
      displayName: "Read Products",
      slug: "product-read",
      action: "READ",
    },
    { upsert: true, returnDocument: "after" }
  );

  const writePerm = await Permission.findOneAndUpdate(
    { slug: "product-write" },
    {
      moduleId: catalogModule._id,
      name: "PRODUCT_WRITE",
      displayName: "Manage Products",
      slug: "product-write",
      action: "WRITE",
    },
    { upsert: true, returnDocument: "after" }
  );

  const adminRole = await Role.findOneAndUpdate(
    { slug: "super-admin" },
    {
      name: "SUPER_ADMIN",
      displayName: "Super Admin",
      slug: "super-admin",
      permissions: [readPerm._id, writePerm._id],
    },
    { upsert: true, returnDocument: "after" }
  );

  // Users, Sessions & OTPs
  console.log("-> Seeding Users, Sessions & Active OTPs...");
  const adminUser = await User.findOneAndUpdate(
    { email: "adichauha465@gmail.com" },
    {
      firstName: "Aditya",
      lastName: "Chauhan",
      email: "adichauha465@gmail.com",
      password: "Password123!",
      phone: "+919876543210",
      roles: [adminRole._id],
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
    },
    { upsert: true, returnDocument: "after" }
  );

  await Session.findOneAndUpdate(
    { deviceId: "postman-seed-001" },
    {
      user: adminUser._id,
      refreshTokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      deviceId: "postman-seed-001",
      deviceName: "MacBook Pro M3",
      deviceType: "DESKTOP",
      ipAddress: "127.0.0.1",
      location: "London, UK",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    { upsert: true }
  );

  await Otp.findOneAndUpdate(
    { email: "adichauha465@gmail.com", purpose: "EMAIL_VERIFICATION" },
    {
      email: "adichauha465@gmail.com",
      otpHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
      purpose: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isUsed: true,
    },
    { upsert: true }
  );

  // Catalog Taxonomy (Collection, Designer, Material, Colour, Pattern, Theme, Style, Room, Brand)
  console.log("-> Seeding Master Catalog Collections, Designers, Materials, Colours, Patterns, Themes, Styles, Rooms...");
  const brand = await Brand.findOneAndUpdate(
    { slug: "house-of-hackney" },
    { name: "House of Hackney", slug: "house-of-hackney", description: "British luxury interior brand" },
    { upsert: true, returnDocument: "after" }
  );

  const gothicColl = await Collection.findOneAndUpdate(
    { slug: "gothic-garden" },
    { name: "Gothic Garden", slug: "gothic-garden", description: "Dramatic dark botanical prints inspired by Victorian flora" },
    { upsert: true, returnDocument: "after" }
  );

  const victorianColl = await Collection.findOneAndUpdate(
    { slug: "victorian-maximalist" },
    { name: "Victorian Maximalist", slug: "victorian-maximalist", description: "Opulent Heritage British wallpapers and fabrics" },
    { upsert: true, returnDocument: "after" }
  );

  const friedaDesigner = await Designer.findOneAndUpdate(
    { slug: "frieda-gormley" },
    { name: "Frieda Gormley & Javvy M Royle", slug: "frieda-gormley", bio: "Co-founders and Creative Directors of House of Hackney", avatar: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/house_of_hackney/avatar.jpg` },
    { upsert: true, returnDocument: "after" }
  );

  const velvetMaterial = await Material.findOneAndUpdate(
    { slug: "luxury-velvet" },
    { name: "Luxury Velvet", slug: "luxury-velvet", description: "Sumptuous cotton-blend velvet woven in England" },
    { upsert: true, returnDocument: "after" }
  );

  const paperMaterial = await Material.findOneAndUpdate(
    { slug: "eco-wallpaper" },
    { name: "Eco Non-Woven Paper", slug: "eco-wallpaper", description: "Sustainably sourced FSC certified wallcovering paper" },
    { upsert: true, returnDocument: "after" }
  );

  const blackColor = await Colour.findOneAndUpdate(
    { slug: "midnight-black" },
    { name: "Midnight Black", slug: "midnight-black", colorHex: "#121212", code: "BLK-01" },
    { upsert: true, returnDocument: "after" }
  );

  const greenColor = await Colour.findOneAndUpdate(
    { slug: "botanical-green" },
    { name: "Botanical Green", slug: "botanical-green", colorHex: "#1b4d3e", code: "GRN-02" },
    { upsert: true, returnDocument: "after" }
  );

  const pinkColor = await Colour.findOneAndUpdate(
    { slug: "dusky-pink" },
    { name: "Dusky Pink", slug: "dusky-pink", colorHex: "#e8c3c5", code: "PNK-03" },
    { upsert: true, returnDocument: "after" }
  );

  const floralPattern = await Pattern.findOneAndUpdate(
    { slug: "botanical-floral" },
    { name: "Botanical & Floral", slug: "botanical-floral", description: "Intricate British flora and Victorian blooms" },
    { upsert: true, returnDocument: "after" }
  );

  const animalPattern = await Pattern.findOneAndUpdate(
    { slug: "animalia-leopard" },
    { name: "Animalia & Wild", slug: "animalia-leopard", description: "Iconic Wild Card leopard prints and fauna" },
    { upsert: true, returnDocument: "after" }
  );

  const heritageTheme = await Theme.findOneAndUpdate(
    { slug: "victorian-heritage" },
    { name: "Victorian Heritage", slug: "victorian-heritage", description: "Classic English country house elegance" },
    { upsert: true, returnDocument: "after" }
  );

  const maximalistStyle = await Style.findOneAndUpdate(
    { slug: "maximalist" },
    { name: "Maximalist Luxury", slug: "maximalist", description: "Vibrant bold prints and immersive color saturation" },
    { upsert: true, returnDocument: "after" }
  );

  const livingRoom = await Room.findOneAndUpdate(
    { slug: "living-room" },
    { name: "Living Room", slug: "living-room", description: "Statement walls and accent seating" },
    { upsert: true, returnDocument: "after" }
  );

  const bedroom = await Room.findOneAndUpdate(
    { slug: "bedroom" },
    { name: "Bedroom & Sanctuary", slug: "bedroom", description: "Serene atmospheric bedroom drapery and wallcoverings" },
    { upsert: true, returnDocument: "after" }
  );

  // Image Folder Processing (Categories, Products, Variants, Media, ProductMedia, Pricing, Inventory)
  console.log("-> Seeding Products with Cloudinary Images & Complete Metadata...");
  const imgDir = path.resolve(__dirname, "images");
  if (!fs.existsSync(imgDir)) {
    console.error("❌ Directory /src/images not found!");
    process.exit(1);
  }

  const topDirs = fs.readdirSync(imgDir).filter((f) => fs.statSync(path.join(imgDir, f)).isDirectory());

  let categoryCount = 0;
  let productCount = 0;
  let variantCount = 0;
  let mediaCount = 0;
  let firstCreatedProduct = null;

  for (const catFolder of topDirs) {
    const catName = titleCase(catFolder.replace(/___/g, " & "));
    const catSlug = slugify(catFolder);

    const category = await Category.findOneAndUpdate(
      { slug: catSlug },
      { name: catName, slug: catSlug, description: `House of Hackney ${catName} Collection`, isFeatured: true, showInMenu: true },
      { upsert: true, returnDocument: "after" }
    );
    categoryCount++;

    const catPath = path.join(imgDir, catFolder);
    const itemFolders = fs.readdirSync(catPath).filter((f) => fs.statSync(path.join(catPath, f)).isDirectory());

    let categoryFirstMediaId = null;

    for (const itemFolder of itemFolders) {
      const parts = itemFolder.split("___");
      const rawProdName = parts[0] ? parts[0] : itemFolder;
      const rawVarName = parts[1] ? parts[1] : "Default";

      const prodTitle = titleCase(rawProdName);
      const prodSlug = slugify(rawProdName);
      const prodSku = `SKU-${slugify(rawProdName).toUpperCase()}`;

      let productType = "WALLPAPER";
      let chosenMaterial = paperMaterial._id;
      if (catFolder.includes("fabric")) {
        productType = "FABRIC";
        chosenMaterial = velvetMaterial._id;
      } else if (catFolder.includes("furnishings")) {
        productType = "FURNITURE";
        chosenMaterial = velvetMaterial._id;
      } else if (catFolder.includes("paint")) {
        productType = "PAINT";
      } else if (catFolder.includes("home_decor")) {
        productType = "ACCESSORY";
      }

      const shortDesc = `Exquisite ${prodTitle} crafted by House of Hackney, featuring signature hand-painted botanical artwork and opulent luxury finishes.`;
      const fullDesc = `Immerse your sanctuary in the iconic maximalist elegance of ${prodTitle} by House of Hackney. Handcrafted with non-toxic, sustainably sourced materials in the United Kingdom, this timeless masterpiece combines Victorian heritage with contemporary luxury.`;

      const product = await Product.findOneAndUpdate(
        { sku: prodSku },
        {
          name: prodTitle,
          slug: prodSlug,
          sku: prodSku,
          barcode: `BAR-${slugify(rawProdName).toUpperCase()}`,
          productType: productType,
          shortDescription: shortDesc,
          description: fullDesc,
          category: category._id,
          brand: brand._id,
          collection: gothicColl._id,
          designer: friedaDesigner._id,
          material: chosenMaterial,
          colours: [blackColor._id, greenColor._id, pinkColor._id],
          patterns: [floralPattern._id, animalPattern._id],
          themes: [heritageTheme._id],
          styles: [maximalistStyle._id],
          rooms: [livingRoom._id, bedroom._id],
          searchKeywords: [prodTitle, catName, "luxury", "victorian", "botanical"],
          isFeatured: true,
          isBestSeller: true,
          isNewArrival: true,
          isTradeAvailable: true,
          status: "PUBLISHED",
        },
        { upsert: true, returnDocument: "after" }
      );
      productCount++;
      if (!firstCreatedProduct) firstCreatedProduct = product;

      await ProductPricing.findOneAndUpdate(
        { product: product._id },
        {
          product: product._id,
          currency: "INR",
          basePrice: 15000,
          sellingPrice: 13500,
          compareAtPrice: 18000,
          tradePrice: 10800,
          taxClass: "GST_18",
          isActive: true,
        },
        { upsert: true }
      );

      const varTitle = titleCase(rawVarName);
      const varSlug = slugify(`${rawProdName}-${rawVarName}`);
      const varSku = `${prodSku}-${slugify(rawVarName).toUpperCase()}`;

      const variant = await Variant.findOneAndUpdate(
        { sku: varSku },
        {
          product: product._id,
          title: `${prodTitle} - ${varTitle}`,
          slug: varSlug,
          sku: varSku,
          barcode: `BAR-${varSku}`,
          attributes: [{ attribute: "Color / Finish", value: varTitle }],
        },
        { upsert: true, returnDocument: "after" }
      );
      variantCount++;

      await Inventory.findOneAndUpdate(
        { product: product._id },
        {
          product: product._id,
          warehouse: "MAIN_WAREHOUSE",
          totalStock: 100,
          availableStock: 95,
          stockStatus: "IN_STOCK",
        },
        { upsert: true }
      );

      const varPath = path.join(catPath, itemFolder);
      const imageFiles = fs
        .readdirSync(varPath)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .slice(0, 2);

      const galleryList = [];
      let thumbnailId = null;

      for (const imgFile of imageFiles) {
        const fileNameNoExt = path.parse(imgFile).name;
        const pubId = `house_of_hackney/${catFolder}/${itemFolder}/${slugify(fileNameNoExt)}`;
        const cloudinaryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${pubId}`;

        const mediaRecord = await Media.findOneAndUpdate(
          { publicId: pubId },
          {
            filename: `${fileNameNoExt}.webp`,
            originalName: imgFile,
            mimeType: "image/webp",
            extension: "webp",
            publicId: pubId,
            url: cloudinaryUrl,
            secureUrl: cloudinaryUrl,
            folder: `house_of_hackney/${catFolder}/${itemFolder}`,
            altText: `${prodTitle} (${varTitle})`,
            caption: `${prodTitle} - House of Hackney Original Print`,
          },
          { upsert: true, returnDocument: "after" }
        );

        if (!thumbnailId) thumbnailId = mediaRecord._id;
        if (!categoryFirstMediaId) categoryFirstMediaId = mediaRecord._id;

        galleryList.push({ media: mediaRecord._id, alt: `${prodTitle} (${varTitle})` });
        mediaCount++;
      }

      if (thumbnailId) {
        await ProductMedia.findOneAndUpdate(
          { product: product._id },
          {
            product: product._id,
            thumbnail: thumbnailId,
            gallery: galleryList,
          },
          { upsert: true }
        );
      }
    }

    if (categoryFirstMediaId) {
      await Category.findByIdAndUpdate(category._id, {
        image: categoryFirstMediaId,
        banner: categoryFirstMediaId,
      });
      await Collection.findByIdAndUpdate(gothicColl._id, { image: categoryFirstMediaId });
    }
  }

  // Attributes, Specs, SEO, Reviews, Filters & Related Products
  console.log("-> Seeding Attributes, Specifications, SEO, Reviews, Filters & Related Products...");
  await Attribute.findOneAndUpdate(
    { slug: "surface-finish" },
    {
      name: "Surface Finish",
      slug: "surface-finish",
      displayName: "Surface Finish",
      description: "Tactile surface finish quality",
      type: "SELECT",
      isFilterable: true,
      values: [
        { label: "Matte Velvet", slug: "matte-velvet", colorCode: "#000000" },
        { label: "Satin Gloss", slug: "satin-gloss", colorCode: "#ffffff" },
      ],
    },
    { upsert: true }
  );

  if (firstCreatedProduct) {
    await Specification.findOneAndUpdate(
      { product: firstCreatedProduct._id },
      {
        product: firstCreatedProduct._id,
        specifications: [
          { key: "Roll Dimensions", value: "10m x 52cm" },
          { key: "Pattern Match", value: "Straight Match (52cm repeat)" },
          { key: "Country of Origin", value: "United Kingdom" },
        ],
      },
      { upsert: true }
    );

    await Seo.findOneAndUpdate(
      { product: firstCreatedProduct._id },
      {
        product: firstCreatedProduct._id,
        metaTitle: `${firstCreatedProduct.name} | House of Hackney`,
        metaDescription: `Buy authentic ${firstCreatedProduct.name} direct from House of Hackney.`,
        canonicalUrl: `https://www.houseofhackney.com/product/${firstCreatedProduct.slug}`,
        keywords: ["luxury wallpaper", "velvet", "house of hackney"],
      },
      { upsert: true }
    );

    const relatedProducts = await Product.find({ _id: { $ne: firstCreatedProduct._id } }).limit(4);
    await Related.findOneAndUpdate(
      { product: firstCreatedProduct._id },
      {
        product: firstCreatedProduct._id,
        relatedProducts: relatedProducts.map((p) => p._id),
      },
      { upsert: true }
    );

    await Review.findOneAndUpdate(
      { product: firstCreatedProduct._id, user: adminUser._id },
      {
        product: firstCreatedProduct._id,
        user: adminUser._id,
        rating: 5,
        title: "Stunning Victorian Floral Design",
        comment: "Exquisite print quality, vivid colors, and luxury texture!",
        status: "APPROVED",
        verifiedPurchase: true,
      },
      { upsert: true }
    );
  }

  await FilterGroup.findOneAndUpdate(
    { code: "color_swatch" },
    {
      name: "Color Swatch",
      code: "color_swatch",
      type: "COLOR_SWATCH",
      options: [
        { label: "Midnight Black", value: "black", colorHex: "#121212" },
        { label: "Botanical Green", value: "green", colorHex: "#1b4d3e" },
        { label: "Dusky Pink", value: "pink", colorHex: "#e8c3c5" },
      ],
    },
    { upsert: true }
  );

  // Commerce (Wishlist, Cart, Address, Coupon, Order, Payment, Shipment, Invoice)
  console.log("-> Seeding B2C Commerce (Wishlist, Cart, Address, Coupon, Order, Payment, Shipment & Invoice)...");
  if (firstCreatedProduct) {
    await Wishlist.findOneAndUpdate(
      { user: adminUser._id },
      { user: adminUser._id, items: [{ product: firstCreatedProduct._id }] },
      { upsert: true }
    );

    const variantSample = await Variant.findOne({ product: firstCreatedProduct._id });
    await Cart.findOneAndUpdate(
      { user: adminUser._id },
      {
        user: adminUser._id,
        items: [{ product: firstCreatedProduct._id, variant: variantSample ? variantSample._id : null, quantity: 2 }],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      { upsert: true }
    );
  }

  const address = await Address.findOneAndUpdate(
    { user: adminUser._id, isDefault: true },
    {
      user: adminUser._id,
      name: "Aditya Chauhan",
      email: "adichauha465@gmail.com",
      phone: "+919876543210",
      street: "123 Hackney Road",
      addressLine2: "Suite 404",
      city: "London",
      state: "Greater London",
      postalCode: "E2 8NA",
      country: "United Kingdom",
      isDefault: true,
    },
    { upsert: true, returnDocument: "after" }
  );

  const coupon = await Coupon.findOneAndUpdate(
    { code: "WELCOME10" },
    {
      code: "WELCOME10",
      description: "10% Welcome Discount for new members",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 5000,
      maxDiscountAmount: 2000,
      usageLimit: 500,
      isActive: true,
    },
    { upsert: true, returnDocument: "after" }
  );

  if (firstCreatedProduct) {
    const order = await Order.findOneAndUpdate(
      { orderNumber: "ORD-2026-0001" },
      {
        orderNumber: "ORD-2026-0001",
        user: adminUser._id,
        items: [{ product: firstCreatedProduct._id, quantity: 2, price: 13500 }],
        subtotal: 27000,
        discountAmount: 2000,
        totalAmount: 25000,
        shippingAddress: address._id,
        orderStatus: "PROCESSING",
        paymentStatus: "PAID",
        notes: "Priority dispatch requested",
      },
      { upsert: true, returnDocument: "after" }
    );

    const payment = await Payment.findOneAndUpdate(
      { transactionId: "TXN-2026-9901" },
      {
        order: order._id,
        user: adminUser._id,
        transactionId: "TXN-2026-9901",
        gatewayTransactionId: "GATEWAY-RAZORPAY-9901",
        paymentMethod: "CARD",
        amount: 25000,
        status: "COMPLETED",
        paidAt: new Date(),
      },
      { upsert: true, returnDocument: "after" }
    );

    const shipment = await Shipment.findOneAndUpdate(
      { trackingNumber: "TRK-GB-881029" },
      {
        order: order._id,
        carrier: "DHL Express",
        trackingNumber: "TRK-GB-881029",
        trackingUrl: "https://www.dhl.com/track/TRK-GB-881029",
        status: "SHIPPED",
        shippedAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, returnDocument: "after" }
    );

    await Invoice.findOneAndUpdate(
      { invoiceNumber: "INV-2026-0001" },
      {
        invoiceNumber: "INV-2026-0001",
        order: order._id,
        user: adminUser._id,
        payment: payment._id,
        shipment: shipment._id,
        totalAmount: 25000,
        taxAmount: 4500,
        status: "ISSUED",
        items: [{ name: firstCreatedProduct.name, quantity: 2, price: 13500 }],
        paidAt: new Date(),
      },
      { upsert: true }
    );
  }

  // B2B Trade Commerce (Company, TradeTier, TradeProfile, TradePricing, Quotation, CreditLimit)
  console.log("-> Seeding B2B Wholesale Trade (Company, TradeTier, TradeProfile, TradePricing, Quotation & CreditLimit)...");
  const company = await Company.findOneAndUpdate(
    { name: "Hackney Interior Design Studio Ltd" },
    {
      name: "Hackney Interior Design Studio Ltd",
      taxNumber: "GB987654321",
      registrationNumber: "CRN-10928374",
      email: "trade@hackneydesign.com",
      phone: "+442079460912",
      website: "https://www.hackneydesign.com",
      country: "United Kingdom",
      logo: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/house_of_hackney/logo.png`,
    },
    { upsert: true, returnDocument: "after" }
  );

  const tradeTier = await TradeTier.findOneAndUpdate(
    { name: "GOLD" },
    {
      name: "GOLD",
      description: "Gold Trade Partner",
      discountPercentage: 20,
      creditLimit: 500000,
      paymentTerm: "NET_30",
      freeShipping: true,
      prioritySupport: true,
    },
    { upsert: true, returnDocument: "after" }
  );

  const tradeProfile = await TradeProfile.findOneAndUpdate(
    { user: adminUser._id },
    {
      user: adminUser._id,
      company: company._id,
      vatNumber: "GB987654321",
      gstNumber: "29AAAAA0000A1Z5",
      businessType: "INTERIOR_DESIGNER",
      phone: "+919876543210",
      website: "https://www.hackneydesign.com",
      tier: tradeTier._id,
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: adminUser._id,
    },
    { upsert: true, returnDocument: "after" }
  );

  await User.findByIdAndUpdate(adminUser._id, { tradeProfile: tradeProfile._id });

  if (firstCreatedProduct) {
    await TradePricing.findOneAndUpdate(
      { tradeTier: tradeTier._id, product: firstCreatedProduct._id },
      {
        tradeTier: tradeTier._id,
        product: firstCreatedProduct._id,
        customPrice: 10800,
        discountPercentage: 20,
      },
      { upsert: true }
    );

    await Quotation.findOneAndUpdate(
      { quoteNumber: "QUOTE-2026-001" },
      {
        quoteNumber: "QUOTE-2026-001",
        user: adminUser._id,
        company: company._id,
        items: [
          {
            product: firstCreatedProduct._id,
            name: firstCreatedProduct.name,
            unitPrice: 13500,
            quantity: 50,
            total: 675000,
          },
        ],
        subtotal: 675000,
        grandTotal: 675000,
        status: "APPROVED",
        adminNotes: "Approved with 20% trade volume discount",
        customerNotes: "Express freight shipping required",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { upsert: true }
    );
  }

  await CreditLimit.findOneAndUpdate(
    { company: company._id },
    {
      company: company._id,
      user: adminUser._id,
      totalCredit: 500000,
      usedCredit: 25000,
      availableCredit: 475000,
      paymentTerm: "NET_30",
      status: "ACTIVE",
    },
    { upsert: true }
  );

  await Counter.findOneAndUpdate(
    { name: "order_number" },
    { name: "order_number", sequence: 1001 },
    { upsert: true }
  );

  console.log("\n🎉 ULTIMATE MASTER DATABASE SEEDING COMPLETED SUCCESSFULLY ACROSS ALL 43 COLLECTIONS!");
  console.log(`✅ Categories Created: ${categoryCount}`);
  console.log(`✅ Products Seeded with 100% Rich Metadata: ${productCount}`);
  console.log(`✅ Variants Created: ${variantCount}`);
  console.log(`✅ Cloudinary Media Records Linked: ${mediaCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

seedMasterDatabase();
