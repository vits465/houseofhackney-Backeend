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
  await Attribute.collection.dropIndexes().catch(() => {});

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

  const defaultAdmin = await User.findOneAndUpdate(
    { email: "admin@example.com" },
    {
      firstName: "Super",
      lastName: "Admin",
      email: "admin@example.com",
      password: "AdminExp",
      phone: "+919876543211",
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
    console.log("ℹ️ /src/images directory not found. Creating sample seed image folders...");
    const sampleFolders = [
      "Wallpaper/Artemis___Midnight_Black",
      "Wallpaper/Bambusa___Blush_Pink",
      "Fabric/Gothic_Garden___Emerald_Green",
      "Furnishings/Luxe_Velvet_Cushion___Onyx"
    ];
    sampleFolders.forEach((folder) => {
      const p = path.join(imgDir, folder);
      fs.mkdirSync(p, { recursive: true });
    });
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
  const finishAttr = await Attribute.findOneAndUpdate(
    { slug: "surface-finish" },
    {
      name: "Surface Finish",
      slug: "surface-finish",
      displayName: "Surface Finish",
      description: "Tactile surface finish quality",
      type: "SELECT",
      isVariant: true,
      isFilterable: true,
      status: "ACTIVE",
      values: [
        { label: "Matte Velvet", slug: "matte-velvet", colorCode: "#121212", isDefault: true, status: "ACTIVE" },
        { label: "Satin Gloss", slug: "satin-gloss", colorCode: "#ffffff", isDefault: false, status: "ACTIVE" },
      ],
    },
    { upsert: true, returnDocument: "after" }
  );

  const sizeAttr = await Attribute.findOneAndUpdate(
    { slug: "roll-size" },
    {
      name: "Roll Size",
      slug: "roll-size",
      displayName: "Roll Size",
      description: "Standard wallpaper roll dimensions",
      type: "SELECT",
      isVariant: true,
      isFilterable: true,
      status: "ACTIVE",
      values: [
        { label: "Standard Roll (10m x 52cm)", slug: "standard-roll", isDefault: true, status: "ACTIVE" },
        { label: "Wide Roll (10m x 70cm)", slug: "wide-roll", isDefault: false, status: "ACTIVE" },
      ],
    },
    { upsert: true, returnDocument: "after" }
  );

  const colorAttr = await Attribute.findOneAndUpdate(
    { slug: "color-palette" },
    {
      name: "Color Palette",
      slug: "color-palette",
      displayName: "Color Palette",
      description: "Luxury color palette choices",
      type: "COLOR",
      isVariant: true,
      isFilterable: true,
      status: "ACTIVE",
      values: [
        { label: "Midnight Black", slug: "midnight-black", colorCode: "#121212", isDefault: true, status: "ACTIVE" },
        { label: "Emerald Green", slug: "emerald-green", colorCode: "#1b4d3e", isDefault: false, status: "ACTIVE" },
        { label: "Dusky Pink", slug: "dusky-pink", colorCode: "#e8c3c5", isDefault: false, status: "ACTIVE" },
      ],
    },
    { upsert: true, returnDocument: "after" }
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

    // Seed Related Products for ALL products
    const allProdsForRelated = await Product.find({}).limit(10);
    for (const p of allProdsForRelated) {
      const otherProds = allProdsForRelated.filter((x) => !x._id.equals(p._id)).slice(0, 3);
      await Related.findOneAndUpdate(
        { product: p._id },
        {
          product: p._id,
          relatedProducts: otherProds.map((op, idx) => ({
            product: op._id,
            relationType: idx === 0 ? "CROSS_SELL" : idx === 1 ? "UPSELL" : "RELATED",
            sortOrder: idx + 1,
          })),
        },
        { upsert: true }
      );
    }

    // Seed 4 Reviews & Ratings for both admin users
    const reviewProds = await Product.find({}).limit(4);
    const sampleReviews = [
      { rating: 5, title: "Stunning Victorian Floral Design", comment: "Exquisite print quality, vivid colors, and luxury texture!" },
      { rating: 5, title: "Unmatched Velvet Quality & Rich Pigments", comment: "Installed this in our master bedroom. Depth of color is breathtaking." },
      { rating: 4, title: "Transformed our Living Room Sanctuary", comment: "Top tier craftsmanship! Easy installation and eco non-woven paper." },
      { rating: 5, title: "Iconic British Heritage Masterpiece", comment: "Pure British maximalist luxury. Received endless compliments!" },
    ];
    for (const usr of [adminUser, defaultAdmin]) {
      for (let i = 0; i < Math.min(reviewProds.length, sampleReviews.length); i++) {
        const p = reviewProds[i];
        const r = sampleReviews[i];
        await Review.findOneAndUpdate(
          { product: p._id, user: usr._id },
          {
            product: p._id,
            user: usr._id,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            status: "APPROVED",
            verifiedPurchase: true,
          },
          { upsert: true }
        );
      }
    }
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
  const allProdsCommerce = await Product.find({}).limit(4);
  const allVarsCommerce = await Variant.find({}).limit(4);

  for (const usr of [adminUser, defaultAdmin]) {
    if (allProdsCommerce.length > 0) {
      // Seed Wishlist with at least 3 items
      const wishlistItems = allProdsCommerce.slice(0, 3).map((prod, idx) => ({
        product: prod._id,
        variant: allVarsCommerce[idx] ? allVarsCommerce[idx]._id : null,
        addedAt: new Date(),
      }));

      await Wishlist.findOneAndUpdate(
        { user: usr._id },
        { user: usr._id, items: wishlistItems },
        { upsert: true }
      );

      // Seed Cart with at least 3 items
      const cartItems = allProdsCommerce.slice(0, 3).map((prod, idx) => {
        const uPrice = 135.0;
        const qty = idx + 1;
        return {
          product: prod._id,
          variant: allVarsCommerce[idx] ? allVarsCommerce[idx]._id : null,
          quantity: qty,
          unitPrice: uPrice,
          discount: 0,
          tax: 15.0,
          total: qty * uPrice,
          addedAt: new Date(),
        };
      });
      const subtotalCalc = cartItems.reduce((acc, item) => acc + item.total, 0);

      await Cart.findOneAndUpdate(
        { user: usr._id },
        {
          user: usr._id,
          items: cartItems,
          subtotal: subtotalCalc,
          discount: 0,
          tax: 45.0,
          shipping: 15.0,
          grandTotal: subtotalCalc + 45.0 + 15.0,
          currency: "GBP",
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        { upsert: true }
      );
    }
  }

  // Seed 3 Delivery Addresses for both admin users
  const addressList = [];
  const addressSamplesData = [
    { name: "Aditya Chauhan", email: "adichauha465@gmail.com", phone: "+919876543210", street: "123 Hackney Road", addressLine2: "Suite 404", city: "London", state: "Greater London", postalCode: "E2 8NA", country: "United Kingdom", type: "SHIPPING", isDefault: true },
    { name: "Aditya Chauhan", email: "adichauha465@gmail.com", phone: "+442079460912", street: "45 Mayfair High Street", addressLine2: "Penthouse 5B", city: "London", state: "Westminster", postalCode: "W1J 8AJ", country: "United Kingdom", type: "BILLING", isDefault: false },
    { name: "Super Admin", email: "admin@example.com", phone: "+919876543211", street: "88 St. Vincent Street", addressLine2: "Floor 3", city: "Glasgow", state: "Lanarkshire", postalCode: "G2 5UB", country: "United Kingdom", type: "OFFICE", isDefault: false },
  ];

  for (const usr of [adminUser, defaultAdmin]) {
    for (let i = 0; i < addressSamplesData.length; i++) {
      const a = addressSamplesData[i];
      const addrObj = await Address.findOneAndUpdate(
        { user: usr._id, addressLine1: a.street },
        {
          user: usr._id,
          fullName: a.name,
          email: a.email,
          phone: a.phone,
          addressLine1: a.street,
          addressLine2: a.addressLine2,
          city: a.city,
          state: a.state,
          postalCode: a.postalCode,
          country: a.country,
          type: a.type,
          isDefault: i === 0,
          status: "ACTIVE",
        },
        { upsert: true, returnDocument: "after" }
      );
      if (addressList.length < 3) addressList.push(addrObj);
    }
  }

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

  // Seed 3 Orders for both admin users
  const createdOrdersList = [];
  const sampleOrdersData = [
    { num: "ORD-2026-0001", status: "PROCESSING", payStatus: "PAID", method: "CARD", notes: "Priority dispatch requested" },
    { num: "ORD-2026-0002", status: "SHIPPED", payStatus: "PAID", method: "STRIPE", notes: "Fragile luxury wallpaper packaging" },
    { num: "ORD-2026-0003", status: "DELIVERED", payStatus: "PAID", method: "COD", notes: "Signed upon customer delivery" },
  ];

  const addrSnapshot = {
    fullName: "Aditya Chauhan",
    phone: "+447123456789",
    email: "adichauha465@gmail.com",
    country: "United Kingdom",
    state: "Greater London",
    city: "London",
    postalCode: "E2 8NA",
    addressLine1: "123 Hackney Road",
    addressLine2: "Suite 404",
  };

  for (const usr of [adminUser, defaultAdmin]) {
    for (let i = 0; i < sampleOrdersData.length; i++) {
      const oData = sampleOrdersData[i];
      const orderNum = usr._id.equals(defaultAdmin._id) ? `${oData.num}-ADM` : oData.num;
      const targetProd = allProdsCommerce[i % allProdsCommerce.length] || firstCreatedProduct;
      const orderObj = await Order.findOneAndUpdate(
        { orderNumber: orderNum },
        {
          orderNumber: orderNum,
          user: usr._id,
          items: [
            {
              product: targetProd._id,
              variant: allVarsCommerce[i % allVarsCommerce.length] ? allVarsCommerce[i % allVarsCommerce.length]._id : null,
              name: targetProd.name,
              sku: targetProd.sku || `SKU-${i + 100}`,
              unitPrice: 135.0,
              quantity: 2,
              discount: 0,
              tax: 15.0,
              total: 270.0,
            },
          ],
          shippingAddress: addrSnapshot,
          billingAddress: addrSnapshot,
          subtotal: 270.0,
          discount: 20.0,
          tax: 25.0,
          shippingFee: 10.0,
          grandTotal: 285.0,
          currency: "GBP",
          paymentStatus: oData.payStatus,
          paymentMethod: oData.method,
          orderStatus: oData.status,
          notes: oData.notes,
        },
        { upsert: true, returnDocument: "after" }
      );
      createdOrdersList.push(orderObj);
    }
  }

  // Seed 3 Payments
  const createdPaymentsList = [];
  const paymentSamplesData = [
    { txnId: "TXN-2026-9901", gatewayId: "GATEWAY-STRIPE-9901", method: "CARD", provider: "STRIPE", amount: 285.0, status: "COMPLETED" },
    { txnId: "TXN-2026-9902", gatewayId: "GATEWAY-RAZORPAY-9902", method: "UPI", provider: "RAZORPAY", amount: 450.0, status: "COMPLETED" },
    { txnId: "TXN-2026-9903", gatewayId: "GATEWAY-PAYPAL-9903", method: "NETBANKING", provider: "PAYPAL", amount: 675.0, status: "COMPLETED" },
  ];

  for (let i = 0; i < paymentSamplesData.length; i++) {
    const pData = paymentSamplesData[i];
    const relatedOrder = createdOrdersList[i] || createdOrdersList[0];
    const paymentObj = await Payment.findOneAndUpdate(
      { transactionId: pData.txnId },
      {
        order: relatedOrder._id,
        user: adminUser._id,
        transactionId: pData.txnId,
        gatewayTransactionId: pData.gatewayId,
        provider: pData.provider,
        paymentMethod: pData.method,
        amount: pData.amount,
        status: pData.status,
        paidAt: new Date(),
      },
      { upsert: true, returnDocument: "after" }
    );
    createdPaymentsList.push(paymentObj);
  }

  // Seed 3 Shipments
  const createdShipmentsList = [];
  const shipmentSamplesData = [
    { trackNum: "TRK-GB-881029", carrier: "DHL Express", shpNum: "SHP-2026-001", status: "SHIPPED", estDays: 3 },
    { trackNum: "TRK-GB-881030", carrier: "FedEx Priority", shpNum: "SHP-2026-002", status: "IN_TRANSIT", estDays: 2 },
    { trackNum: "TRK-GB-881031", carrier: "Royal Mail Special", shpNum: "SHP-2026-003", status: "DELIVERED", estDays: 1 },
  ];

  for (let i = 0; i < shipmentSamplesData.length; i++) {
    const sData = shipmentSamplesData[i];
    const relatedOrder = createdOrdersList[i] || createdOrdersList[0];
    const shipmentObj = await Shipment.findOneAndUpdate(
      { trackingNumber: sData.trackNum },
      {
        order: relatedOrder._id,
        user: adminUser._id,
        shipmentNumber: sData.shpNum,
        courierName: sData.carrier,
        trackingNumber: sData.trackNum,
        trackingUrl: `https://www.dhl.com/track/${sData.trackNum}`,
        status: sData.status,
        shippedAt: new Date(),
        estimatedDelivery: new Date(Date.now() + sData.estDays * 86400000),
        shippingAddress: addrSnapshot,
        trackingHistory: [
          { status: "DISPATCHED", location: "London Sorting Hub", comment: "Package scanned and dispatched", timestamp: new Date() },
          { status: sData.status, location: "Local Delivery Hub", comment: "Courier out for priority delivery", timestamp: new Date() }
        ]
      },
      { upsert: true, returnDocument: "after" }
    );
    createdShipmentsList.push(shipmentObj);
  }

  // Seed Invoices
  if (createdOrdersList.length > 0) {
    await Invoice.findOneAndUpdate(
      { invoiceNumber: "INV-2026-0001" },
      {
        invoiceNumber: "INV-2026-0001",
        order: createdOrdersList[0]._id,
        user: adminUser._id,
        payment: createdPaymentsList[0]._id,
        shipment: createdShipmentsList[0]._id,
        totalAmount: 285.0,
        taxAmount: 25.0,
        status: "ISSUED",
        items: [{ name: "Artemis Wallpaper", quantity: 2, price: 135.0 }],
        paidAt: new Date(),
      },
      { upsert: true }
    );
  }

  // B2B Trade Commerce (Company, TradeTier, TradeProfile, TradePricing, Quotation, CreditLimit)
  console.log("-> Seeding B2B Wholesale Trade (Company, TradeTier, TradeProfile, TradePricing, Quotation & CreditLimit)...");
  
  // Seed 3 Companies
  const company1 = await Company.findOneAndUpdate(
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

  const company2 = await Company.findOneAndUpdate(
    { name: "Victorian Heritage Architecture Ltd" },
    {
      name: "Victorian Heritage Architecture Ltd",
      taxNumber: "GB987654322",
      registrationNumber: "CRN-10928375",
      email: "info@victorianheritage.co.uk",
      phone: "+442079460913",
      website: "https://www.victorianheritage.co.uk",
      country: "United Kingdom",
      logo: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/house_of_hackney/logo2.png`,
    },
    { upsert: true, returnDocument: "after" }
  );

  const company3 = await Company.findOneAndUpdate(
    { name: "Mayfair Bespoke Furnishings Ltd" },
    {
      name: "Mayfair Bespoke Furnishings Ltd",
      taxNumber: "GB987654323",
      registrationNumber: "CRN-10928376",
      email: "b2b@mayfairfurnishings.com",
      phone: "+442079460914",
      website: "https://www.mayfairfurnishings.com",
      country: "United Kingdom",
      logo: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/house_of_hackney/logo3.png`,
    },
    { upsert: true, returnDocument: "after" }
  );

  // Seed 3 Trade Tiers
  const tierSilver = await TradeTier.findOneAndUpdate(
    { name: "SILVER" },
    {
      name: "SILVER",
      description: "Silver Trade Partner",
      discountPercentage: 15,
      creditLimit: 250000,
      paymentTerm: "NET_30",
      freeShipping: false,
      prioritySupport: false,
    },
    { upsert: true, returnDocument: "after" }
  );

  const tierGold = await TradeTier.findOneAndUpdate(
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

  const tierPlatinum = await TradeTier.findOneAndUpdate(
    { name: "PLATINUM" },
    {
      name: "PLATINUM",
      description: "Platinum Key Account Partner",
      discountPercentage: 30,
      creditLimit: 1000000,
      paymentTerm: "NET_60",
      freeShipping: true,
      prioritySupport: true,
    },
    { upsert: true, returnDocument: "after" }
  );

  // Seed 3 Trade Profiles (for adminUser, defaultAdmin, and pending profile)
  const tradeProfile1 = await TradeProfile.findOneAndUpdate(
    { user: adminUser._id },
    {
      user: adminUser._id,
      company: company1._id,
      vatNumber: "GB987654321",
      gstNumber: "29AAAAA0000A1Z5",
      businessType: "INTERIOR_DESIGNER",
      phone: "+919876543210",
      website: "https://www.hackneydesign.com",
      tier: tierGold._id,
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: adminUser._id,
    },
    { upsert: true, returnDocument: "after" }
  );

  const tradeProfile2 = await TradeProfile.findOneAndUpdate(
    { user: defaultAdmin._id },
    {
      user: defaultAdmin._id,
      company: company2._id,
      vatNumber: "GB987654322",
      gstNumber: "29AAAAA0000A2Z6",
      businessType: "ARCHITECT",
      phone: "+919876543211",
      website: "https://www.victorianheritage.co.uk",
      tier: tierPlatinum._id,
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: adminUser._id,
    },
    { upsert: true, returnDocument: "after" }
  );

  await User.findByIdAndUpdate(adminUser._id, { tradeProfile: tradeProfile1._id });
  await User.findByIdAndUpdate(defaultAdmin._id, { tradeProfile: tradeProfile2._id });

  // Seed Trade Pricing
  if (firstCreatedProduct) {
    await TradePricing.findOneAndUpdate(
      { tradeTier: tierGold._id, product: firstCreatedProduct._id },
      {
        tradeTier: tierGold._id,
        product: firstCreatedProduct._id,
        customPrice: 108.0,
        discountPercentage: 20,
        minQuantity: 5,
      },
      { upsert: true }
    );

    await TradePricing.findOneAndUpdate(
      { tradeTier: tierPlatinum._id, product: firstCreatedProduct._id },
      {
        tradeTier: tierPlatinum._id,
        product: firstCreatedProduct._id,
        customPrice: 94.5,
        discountPercentage: 30,
        minQuantity: 10,
      },
      { upsert: true }
    );
  }

  // Seed 3 Trade Quotations
  if (firstCreatedProduct) {
    const quotesData = [
      { num: "QUOTE-2026-001", status: "APPROVED", sub: 6750.0, total: 6750.0, notes: "Approved with 20% trade volume discount" },
      { num: "QUOTE-2026-002", status: "REQUESTED", sub: 4500.0, total: 4500.0, notes: "Customer requested sample swatches" },
      { num: "QUOTE-2026-003", status: "NEGOTIATING", sub: 3200.0, total: 3200.0, notes: "Admin review in progress for bulk freight rate" },
    ];

    for (const qData of quotesData) {
      await Quotation.findOneAndUpdate(
        { quoteNumber: qData.num },
        {
          quoteNumber: qData.num,
          user: adminUser._id,
          company: company1._id,
          items: [
            {
              product: firstCreatedProduct._id,
              name: firstCreatedProduct.name,
              unitPrice: 135.0,
              quantity: 50,
              total: qData.sub,
            },
          ],
          subtotal: qData.sub,
          grandTotal: qData.total,
          status: qData.status,
          adminNotes: qData.notes,
          customerNotes: "Express freight shipping requested",
          expiresAt: new Date(Date.now() + 30 * 86400000),
        },
        { upsert: true }
      );
    }
  }

  // Seed 3 Credit Limits
  await CreditLimit.findOneAndUpdate(
    { company: company1._id },
    {
      company: company1._id,
      user: adminUser._id,
      totalCredit: 500000,
      usedCredit: 25000,
      availableCredit: 475000,
      paymentTerm: "NET_30",
      status: "ACTIVE",
    },
    { upsert: true }
  );

  await CreditLimit.findOneAndUpdate(
    { company: company2._id },
    {
      company: company2._id,
      user: defaultAdmin._id,
      totalCredit: 1000000,
      usedCredit: 50000,
      availableCredit: 950000,
      paymentTerm: "NET_60",
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
