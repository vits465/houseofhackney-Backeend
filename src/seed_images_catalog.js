import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import Category from "./modules/catalog/Category/category.model.js";
import Brand from "./modules/catalog/Brand/brand.model.js";
import Collection from "./modules/catalog/Collection/collection.model.js";
import Designer from "./modules/catalog/Designer/designer.model.js";
import Material from "./modules/catalog/Material/material.model.js";
import Colour from "./modules/catalog/Colour/color.model.js";
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

async function seedCompleteProductAttributesCatalog() {
  console.log("🎨 Starting Full Catalog & Complete Product Metadata Seeder...");
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/house_of_hackney");

  // Clean obsolete collection indexes
  await Category.collection.dropIndexes().catch(() => {});
  await Product.collection.dropIndexes().catch(() => {});
  await Inventory.collection.dropIndexes().catch(() => {});
  await ProductPricing.collection.dropIndexes().catch(() => {});
  await Variant.collection.dropIndexes().catch(() => {});
  await Media.collection.dropIndexes().catch(() => {});

  // Seed Master Collections
  console.log("-> Seeding Master Catalog Collections, Designers, Materials, Colours, Patterns, Themes, Styles, Rooms...");
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

  // Seed Master Designers
  const friedaDesigner = await Designer.findOneAndUpdate(
    { slug: "frieda-gormley" },
    { name: "Frieda Gormley & Javvy M Royle", slug: "frieda-gormley", bio: "Co-founders and Creative Directors of House of Hackney" },
    { upsert: true, returnDocument: "after" }
  );

  // Seed Master Materials
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

  // Seed Master Colours
  const blackColor = await Colour.findOneAndUpdate(
    { slug: "midnight-black" },
    { name: "Midnight Black", slug: "midnight-black", colorHex: "#121212" },
    { upsert: true, returnDocument: "after" }
  );

  const greenColor = await Colour.findOneAndUpdate(
    { slug: "botanical-green" },
    { name: "Botanical Green", slug: "botanical-green", colorHex: "#1b4d3e" },
    { upsert: true, returnDocument: "after" }
  );

  const pinkColor = await Colour.findOneAndUpdate(
    { slug: "dusky-pink" },
    { name: "Dusky Pink", slug: "dusky-pink", colorHex: "#e8c3c5" },
    { upsert: true, returnDocument: "after" }
  );

  // Seed Master Patterns
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

  // Seed Master Themes
  const heritageTheme = await Theme.findOneAndUpdate(
    { slug: "victorian-heritage" },
    { name: "Victorian Heritage", slug: "victorian-heritage", description: "Classic English country house elegance" },
    { upsert: true, returnDocument: "after" }
  );

  // Seed Master Styles
  const maximalistStyle = await Style.findOneAndUpdate(
    { slug: "maximalist" },
    { name: "Maximalist Luxury", slug: "maximalist", description: "Vibrant bold prints and immersive color saturation" },
    { upsert: true, returnDocument: "after" }
  );

  // Seed Master Rooms
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

  // Ensure default Brand
  const brand = await Brand.findOneAndUpdate(
    { slug: "house-of-hackney" },
    { name: "House of Hackney", slug: "house-of-hackney", description: "British luxury interior brand" },
    { upsert: true, returnDocument: "after" }
  );

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

  for (const catFolder of topDirs) {
    const catName = titleCase(catFolder.replace(/___/g, " & "));
    const catSlug = slugify(catFolder);

    const category = await Category.findOneAndUpdate(
      { slug: catSlug },
      { name: catName, slug: catSlug, description: `House of Hackney ${catName} Collection`, isFeatured: true },
      { upsert: true, returnDocument: "after" }
    );
    categoryCount++;

    const catPath = path.join(imgDir, catFolder);
    const itemFolders = fs.readdirSync(catPath).filter((f) => fs.statSync(path.join(catPath, f)).isDirectory());

    let categoryFirstMediaId = null;

    for (const itemFolder of itemFolders) {
      // Format: [product_name]___[variant_name]
      const parts = itemFolder.split("___");
      const rawProdName = parts[0] ? parts[0] : itemFolder;
      const rawVarName = parts[1] ? parts[1] : "Default";

      const prodTitle = titleCase(rawProdName);
      const prodSlug = slugify(rawProdName);
      const prodSku = `SKU-${slugify(rawProdName).toUpperCase()}`;

      // Map productType enum
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

      // Rich descriptions and complete metadata fields
      const shortDesc = `Exquisite ${prodTitle} crafted by House of Hackney, featuring signature hand-painted botanical artwork and opulent luxury finishes.`;
      const fullDesc = `Immerse your sanctuary in the iconic maximalist elegance of ${prodTitle} by House of Hackney. Handcrafted with non-toxic, sustainably sourced materials in the United Kingdom, this timeless masterpiece combines Victorian heritage with contemporary luxury.`;

      const product = await Product.findOneAndUpdate(
        { sku: prodSku },
        {
          name: prodTitle,
          slug: prodSlug,
          sku: prodSku,
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
          isFeatured: true,
          isBestSeller: true,
          isNewArrival: true,
          isTradeAvailable: true,
          status: "PUBLISHED",
        },
        { upsert: true, returnDocument: "after" }
      );
      productCount++;

      // Create pricing
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

      // Create Variant
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
          attributes: [{ attribute: "Color / Finish", value: varTitle }],
        },
        { upsert: true, returnDocument: "after" }
      );
      variantCount++;

      // Create Inventory
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

      // Import Cloudinary image links based on folder structure
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

        // Lookup or create Cloudinary Media record
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

    // Assign main category image and banner from first Cloudinary image
    if (categoryFirstMediaId) {
      await Category.findByIdAndUpdate(category._id, {
        image: categoryFirstMediaId,
        banner: categoryFirstMediaId,
      });
    }
  }

  console.log("\n🎉 COMPLETE PRODUCT METADATA & CATALOG SEEDED SUCCESSFULLY!");
  console.log(`✅ Categories Created & Image Linked: ${categoryCount}`);
  console.log(`✅ Products Created with Rich Descriptions & Metadata: ${productCount}`);
  console.log(`✅ Variants Created: ${variantCount}`);
  console.log(`✅ Cloudinary Media Records Linked: ${mediaCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

seedCompleteProductAttributesCatalog();
