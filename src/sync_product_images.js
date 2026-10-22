import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import "./shared/database/models.js";
import Product from "./modules/product/product/product.model.js";
import Variant from "./modules/product/Variant/variant.model.js";
import ProductMedia from "./modules/product/product-media/productMedia.model.js";
import Media from "./modules/media/media.model.js";

function norm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function syncCatalogImages() {
  console.log("🚀 Starting Comprehensive Product & Variant Image Synchronization...");
  await mongoose.connect(process.env.MONGODB_URI);

  const products = await Product.find({ deletedAt: null });
  const variants = await Variant.find({ deletedAt: null });
  const allMedia = await Media.find({ status: "ACTIVE" });

  console.log(`📦 Loaded: ${products.length} Products, ${variants.length} Variants, ${allMedia.length} Media items.`);

  // Group media by folder
  const mediaByFolder = new Map();
  for (const m of allMedia) {
    const f = m.folder || "unknown";
    if (!mediaByFolder.has(f)) mediaByFolder.set(f, []);
    mediaByFolder.get(f).push(m);
  }

  // Group variants by product ID
  const variantsByProduct = new Map();
  for (const v of variants) {
    const pId = v.product.toString();
    if (!variantsByProduct.has(pId)) variantsByProduct.set(pId, []);
    variantsByProduct.get(pId).push(v);
  }

  // Variant -> Media mapping
  const variantMediaMap = new Map();

  for (const [folder, folderMedia] of mediaByFolder.entries()) {
    const parts = folder.split("/");
    const itemFolder = parts[parts.length - 1]; // e.g., "heavenly_hemp___acorn"
    const [rawProd, rawVar] = itemFolder.split("___");
    if (!rawProd) continue;

    // Find product matching rawProd
    const prod = products.find(
      (p) =>
        norm(p.slug) === norm(rawProd) ||
        norm(p.sku) === norm(`SKU-${rawProd}`) ||
        norm(p.name) === norm(rawProd)
    );

    if (!prod) continue;

    const prodVars = variantsByProduct.get(prod._id.toString()) || [];
    let matchedVariant = null;

    if (rawVar) {
      matchedVariant = prodVars.find((v) => {
        return (
          norm(v.slug).includes(norm(rawVar)) ||
          norm(v.title).includes(norm(rawVar)) ||
          norm(v.sku).includes(norm(rawVar))
        );
      });
    }

    if (!matchedVariant && prodVars.length === 1) {
      matchedVariant = prodVars[0];
    }

    if (matchedVariant) {
      const vId = matchedVariant._id.toString();
      if (!variantMediaMap.has(vId)) variantMediaMap.set(vId, []);
      variantMediaMap.get(vId).push(...folderMedia);
    }
  }

  console.log(`🎯 Directly matched variants with specific folder media: ${variantMediaMap.size} / ${variants.length}`);

  // Fallback map for any variants without direct folder media
  for (const v of variants) {
    const vId = v._id.toString();
    if (variantMediaMap.has(vId) && variantMediaMap.get(vId).length > 0) continue;

    const prod = products.find((p) => p._id.equals(v.product));
    let fallbackMedia = [];

    if (norm(v.title).includes("artemis") || (prod && norm(prod.name).includes("artemis"))) {
      fallbackMedia = allMedia.filter((m) => /artemis/i.test(m.folder || "")).slice(0, 2);
    } else if (norm(v.title).includes("gothic") || (prod && norm(prod.name).includes("gothic"))) {
      fallbackMedia = allMedia.filter((m) => /gothic/i.test(m.folder || "")).slice(0, 2);
    } else if (norm(v.title).includes("cushion") || (prod && norm(prod.name).includes("cushion"))) {
      fallbackMedia = allMedia.filter((m) => /cushion/i.test(m.folder || "")).slice(0, 2);
    } else if (norm(v.title).includes("bambusa") || (prod && norm(prod.name).includes("bambusa"))) {
      fallbackMedia = allMedia.filter((m) => /wallpaper/i.test(m.folder || "")).slice(0, 2);
    }

    if (!fallbackMedia.length) {
      fallbackMedia = allMedia.slice(0, 2);
    }

    variantMediaMap.set(vId, fallbackMedia);
    console.log(`  ↪ Linked fallback images for variant: "${v.title}" (${fallbackMedia.length} images)`);
  }

  // 1. Update all Variants in MongoDB
  let updatedVariants = 0;
  for (const v of variants) {
    const vId = v._id.toString();
    const vMedias = variantMediaMap.get(vId) || [];
    if (!vMedias.length) continue;

    const primaryMedia = vMedias[0];
    const mediaIds = vMedias.map((m) => m._id);
    const primaryUrl = primaryMedia.secureUrl || primaryMedia.url;

    await Variant.findByIdAndUpdate(v._id, {
      thumbnail: primaryMedia._id,
      image: primaryUrl,
      images: mediaIds,
      gallery: mediaIds,
    });
    updatedVariants++;
  }

  console.log(`✅ Updated ${updatedVariants} Variants with proper thumbnail, image, images and gallery.`);

  // 2. Update all Products & ProductMedia in MongoDB
  let updatedProducts = 0;
  let updatedProductMedia = 0;

  for (const prod of products) {
    const prodVars = variantsByProduct.get(prod._id.toString()) || [];
    const allProdMediaMap = new Map();

    for (const v of prodVars) {
      const vMedias = variantMediaMap.get(v._id.toString()) || [];
      for (const m of vMedias) {
        if (!allProdMediaMap.has(m._id.toString())) {
          allProdMediaMap.set(m._id.toString(), {
            media: m,
            alt: `${prod.name} - ${v.title}`,
          });
        }
      }
    }

    const uniqueMediaEntries = Array.from(allProdMediaMap.values());
    let primaryThumbnailUrl = "";
    let primaryThumbnailId = null;

    if (uniqueMediaEntries.length > 0) {
      primaryThumbnailId = uniqueMediaEntries[0].media._id;
      primaryThumbnailUrl = uniqueMediaEntries[0].media.secureUrl || uniqueMediaEntries[0].media.url;
    }

    const allImageUrls = uniqueMediaEntries.map((e) => e.media.secureUrl || e.media.url).filter(Boolean);

    // Update Product document directly
    await Product.findByIdAndUpdate(prod._id, {
      thumbnail: primaryThumbnailUrl,
      images: allImageUrls,
    });
    updatedProducts++;

    // Update or Create ProductMedia document
    const galleryItems = uniqueMediaEntries.map((e, idx) => ({
      media: e.media._id,
      alt: e.alt,
      sortOrder: idx,
    }));

    if (primaryThumbnailId) {
      await ProductMedia.findOneAndUpdate(
        { product: prod._id },
        {
          product: prod._id,
          thumbnail: primaryThumbnailId,
          gallery: galleryItems,
          deletedAt: null,
        },
        { upsert: true }
      );
      updatedProductMedia++;
    }
  }

  console.log(`✅ Updated ${updatedProducts} Products with direct thumbnail and images URLs.`);
  console.log(`✅ Synchronized ${updatedProductMedia} ProductMedia records with complete multi-variant galleries.`);

  // Verification
  const prodsWithoutThumb = await Product.countDocuments({
    deletedAt: null,
    $or: [{ thumbnail: "" }, { thumbnail: null }],
  });
  const varsWithoutThumb = await Variant.countDocuments({
    deletedAt: null,
    $or: [{ image: "" }, { image: null }],
  });

  console.log("\n📊 Final Verification Report:");
  console.log(`- Products without thumbnail: ${prodsWithoutThumb} (Target: 0)`);
  console.log(`- Variants without image: ${varsWithoutThumb} (Target: 0)`);

  await mongoose.disconnect();
  console.log("🎉 PRODUCT & VARIANT IMAGE SYNCHRONIZATION COMPLETE!");
}

syncCatalogImages().catch((err) => {
  console.error("❌ Synchronization failed:", err);
  process.exit(1);
});
