import fs from "fs";
import path from "path";
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

async function runUploader(limit = 10) {
  console.log("🚀 Starting High-Res Cloudinary Image Enhancer...");
  
  // 1. Fetch products from live API
  const res = await fetch("https://houseofhackney-backeend.vercel.app/api/v1/products?limit=200");
  const json = await res.json();
  const products = json.data || [];
  console.log(`📦 Loaded ${products.length} products from catalogue.`);

  const publicIds = new Set();
  for (const p of products) {
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
          publicIds.add(match[1]);
        }
      }
    });
  }

  const base = "d:/Oscar/HOUSE/src/images";
  const tasks = [];

  for (const pid of publicIds) {
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

    tasks.push({
      publicId: pid,
      folder: pid.substring(0, lastSlash),
      idOnly: baseName,
      localPath: path.join(localDir, chosenFile.name),
      fileName: chosenFile.name,
      fileSize: chosenFile.size,
    });
  }

  console.log(`🎯 Identified ${tasks.length} public IDs mapped to high-res source files.`);
  const batch = limit ? tasks.slice(0, limit) : tasks;
  console.log(`⚡ Processing batch of ${batch.length} images...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
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

      successCount++;
      console.log(`[${i + 1}/${batch.length}] ✅ Replaced ${item.publicId} with crisp ${result.width}x${result.height} (${(result.bytes / 1024).toFixed(1)} KB)`);
    } catch (err) {
      failCount++;
      console.error(`[${i + 1}/${batch.length}] ❌ Failed ${item.publicId}:`, err.message);
    }
  }

  console.log(`\n🎉 Finished! Succeeded: ${successCount}, Failed: ${failCount}`);
}

const limitArg = process.argv[2] ? parseInt(process.argv[2], 10) : 10;
runUploader(limitArg);
