import fs from "fs";
import path from "path";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function uploadStream(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
    stream.end(buffer);
  });
}

// Concurrency pool helper
async function mapConcurrent(items, concurrency, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      try {
        const res = await fn(items[current], current, items.length);
        results[current] = { status: "fulfilled", value: res };
      } catch (err) {
        results[current] = { status: "rejected", reason: err };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function runFullCatalogImageEnhancer() {
  console.log("⚡ Starting Full Catalog High-Resolution Image Enhancer...");
  
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });
  console.log("✅ Connected to MongoDB Atlas.");

  const mediaCol = mongoose.connection.db.collection("media");
  const productsCol = mongoose.connection.db.collection("products");
  const variantsCol = mongoose.connection.db.collection("variants");
  const pmediaCol = mongoose.connection.db.collection("productmedias");

  // 1. Fetch all products across all pages from live API
  let allProducts = [];
  let page = 1;
  while (true) {
    const res = await fetch(`https://houseofhackney-backeend.vercel.app/api/v1/products?limit=50&page=${page}`);
    const json = await res.json();
    const items = json.data || [];
    allProducts.push(...items);
    if (!json.pagination || page >= json.pagination.totalPages) break;
    page++;
  }
  console.log(`📦 Loaded ${allProducts.length} products across all pages.`);

  // 2. Collect all Cloudinary public_ids
  const publicIdMap = new Map();

  for (const p of allProducts) {
    const urls = [];
    if (p.thumbnail) urls.push(p.thumbnail);
    (p.images || []).forEach((u) => urls.push(u));
    (p.variants || []).forEach((v) => {
      if (v.thumbnail?.url) urls.push(v.thumbnail.url);
      else if (typeof v.thumbnail === "string") urls.push(v.thumbnail);
      (v.images || []).forEach((u) => urls.push(u));
    });

    urls.forEach((u) => {
      if (u.includes("res.cloudinary.com")) {
        const clean = u.replace(/\/c_scale,[^/]+\//, "/");
        const match = clean.match(/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|webp|png)$/) || clean.match(/upload\/(?:v\d+\/)?(.+)$/);
        if (match) {
          const pid = match[1];
          if (!publicIdMap.has(pid)) {
            publicIdMap.set(pid, { pid, productIds: new Set([p._id]) });
          } else {
            publicIdMap.get(pid).productIds.add(p._id);
          }
        }
      }
    });
  }

  // Also query Media collection for all media records
  const allMediaDocs = await mediaCol.find({}).toArray();
  allMediaDocs.forEach((m) => {
    if (m.publicId && !publicIdMap.has(m.publicId)) {
      publicIdMap.set(m.publicId, { pid: m.publicId, productIds: new Set() });
    }
  });

  console.log(`🎯 Found ${publicIdMap.size} unique Cloudinary public IDs across database.`);

  const base = "d:/Oscar/HOUSE/src/images";
  const uploadTasks = [];

  for (const [pid, info] of publicIdMap) {
    const lastSlash = pid.lastIndexOf("/");
    const relFolder = pid.substring(0, lastSlash).replace(/^house_of_hackney\//, "");
    const baseName = pid.substring(lastSlash + 1);
    const localDir = path.join(base, relFolder);

    if (!fs.existsSync(localDir)) continue;

    const files = fs.readdirSync(localDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    if (!files.length) continue;

    const sorted = files
      .map((f) => ({ name: f, size: fs.statSync(path.join(localDir, f)).size }))
      .sort((a, b) => b.size - a.size);

    const isOne = baseName.endsWith("-1");
    const chosenFile = isOne && sorted.length > 1 ? sorted[1] : sorted[0];

    uploadTasks.push({
      publicId: pid,
      folder: pid.substring(0, lastSlash),
      idOnly: baseName,
      localPath: path.join(localDir, chosenFile.name),
      fileName: chosenFile.name,
      fileSize: chosenFile.size,
    });
  }

  console.log(`🚀 ${uploadTasks.length} tasks ready for high-resolution processing.`);

  let doneCount = 0;
  let successCount = 0;
  let failCount = 0;

  // Run upload with concurrency 4
  await mapConcurrent(uploadTasks, 4, async (item, idx, total) => {
    try {
      const compressedBuffer = await sharp(item.localPath)
        .resize({ width: 1400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      const result = await uploadStream(compressedBuffer, {
        folder: item.folder,
        public_id: item.idOnly,
        overwrite: true,
        invalidate: true,
        resource_type: "image",
      });

      // Update Media collection with new dimensions
      await mediaCol.updateOne(
        { publicId: item.publicId },
        {
          $set: {
            width: result.width,
            height: result.height,
            size: result.bytes,
            format: "webp",
            updatedAt: new Date(),
          },
        }
      );

      successCount++;
      doneCount++;
      if (doneCount % 10 === 0 || doneCount === total) {
        console.log(`[${doneCount}/${total}] ✅ Uploaded & Updated: ${item.publicId} (${result.width}x${result.height}, ${(result.bytes / 1024).toFixed(1)} KB)`);
      }
    } catch (err) {
      failCount++;
      doneCount++;
      console.error(`[${doneCount}/${total}] ❌ Failed: ${item.publicId}: ${err.message}`);
    }
  });

  console.log(`\n🎉 Image Upload Summary: ${successCount} updated successfully, ${failCount} failed.`);

  // 3. Fix any products where thumbnail is null by setting from variants
  const allDbProducts = await productsCol.find({}).toArray();
  let fixedThumbnails = 0;

  for (const p of allDbProducts) {
    if (!p.thumbnail) {
      const vars = await variantsCol.find({ product: p._id }).toArray();
      let foundThumb = null;
      for (const v of vars) {
        if (v.thumbnail) {
          if (typeof v.thumbnail === "string") foundThumb = v.thumbnail;
          else if (v.thumbnail.url || v.thumbnail.secureUrl) foundThumb = v.thumbnail.secureUrl || v.thumbnail.url;
        }
        if (!foundThumb && v.image) foundThumb = v.image;
        if (!foundThumb && Array.isArray(v.images) && v.images.length > 0) {
          const first = v.images[0];
          foundThumb = typeof first === "string" ? first : first?.secureUrl || first?.url;
        }
        if (foundThumb) break;
      }

      if (foundThumb) {
        await productsCol.updateOne({ _id: p._id }, { $set: { thumbnail: foundThumb } });
        fixedThumbnails++;
      }
    }
  }

  console.log(`✨ Fixed direct thumbnail on ${fixedThumbnails} products in MongoDB.`);
  await mongoose.disconnect();
  console.log("🏁 Done!");
}

runFullCatalogImageEnhancer().catch(console.error);
