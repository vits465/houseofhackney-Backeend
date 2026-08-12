import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import Media from "./modules/media/media.model.js";
import ProductMedia from "./modules/product/product-media/productMedia.model.js";
import Product from "./modules/product/product/product.model.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// Upload Sharp-compressed buffer stream to Cloudinary
function uploadCompressedStream(buffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    uploadStream.end(buffer);
  });
}

async function uploadCompressedCatalogToCloudinary() {
  console.log("⚡ Starting Compressed & Optimized Folder-Structure Cloudinary Image Uploader...");
  console.log(`📡 Connected to Cloudinary Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);

  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/house_of_hackney");

  const imgDir = path.resolve(__dirname, "images");
  if (!fs.existsSync(imgDir)) {
    console.error("❌ Directory /src/images not found!");
    process.exit(1);
  }

  const topDirs = fs.readdirSync(imgDir).filter((f) => fs.statSync(path.join(imgDir, f)).isDirectory());

  let totalUploaded = 0;
  let totalErrors = 0;

  for (const catFolder of topDirs) {
    const catPath = path.join(imgDir, catFolder);
    const itemFolders = fs.readdirSync(catPath).filter((f) => fs.statSync(path.join(catPath, f)).isDirectory());

    console.log(`\n📁 Category Folder: '${catFolder}' (${itemFolders.length} Product Folders)`);

    for (const itemFolder of itemFolders) {
      const varPath = path.join(catPath, itemFolder);
      const imageFiles = fs
        .readdirSync(varPath)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .slice(0, 2); // Top 2 images per variant

      const parts = itemFolder.split("___");
      const rawProdName = parts[0] ? parts[0] : itemFolder;
      const prodSku = `SKU-${slugify(rawProdName).toUpperCase()}`;

      const product = await Product.findOne({ sku: prodSku });

      const cloudinaryFolderPath = `house_of_hackney/${catFolder}/${itemFolder}`;
      const galleryList = [];
      let thumbnailId = null;

      for (const imgFile of imageFiles) {
        const fullLocalPath = path.join(varPath, imgFile);
        const fileNameNoExt = path.parse(imgFile).name;

        try {
          // Sharp compression and webp conversion
          const compressedBuffer = await sharp(fullLocalPath)
            .resize({ width: 1400, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

          // Upload compressed buffer to Cloudinary
          const result = await uploadCompressedStream(compressedBuffer, {
            folder: cloudinaryFolderPath,
            public_id: slugify(fileNameNoExt),
            overwrite: true,
            resource_type: "image",
            transformation: [
              { quality: "auto:good" },
              { fetch_format: "auto" }
            ],
          });

          // Save or update Media document
          const mediaRecord = await Media.findOneAndUpdate(
            { publicId: result.public_id },
            {
              filename: `${fileNameNoExt}.webp`,
              originalName: imgFile,
              mimeType: "image/webp",
              extension: "webp",
              size: result.bytes,
              width: result.width,
              height: result.height,
              format: result.format || "webp",
              publicId: result.public_id,
              url: result.url,
              secureUrl: result.secure_url,
              folder: cloudinaryFolderPath,
              altText: `${itemFolder} - ${imgFile}`,
            },
            { upsert: true, returnDocument: "after" }
          );

          if (!thumbnailId) thumbnailId = mediaRecord._id;
          galleryList.push({ media: mediaRecord._id, alt: imgFile });

          totalUploaded++;
          console.log(`  └─ ⚡ Compressed & Uploaded (${(result.bytes / 1024).toFixed(1)} KB): ${result.secure_url}`);
        } catch (err) {
          totalErrors++;
          console.error(`  └─ ❌ Upload failed for ${imgFile}:`, err.message);
        }
      }

      // Link Cloudinary Media to ProductMedia collection
      if (product && thumbnailId) {
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
  }

  console.log("\n🎉 COMPRESSED CLOUDINARY FOLDER-STRUCTURE UPLOAD COMPLETE!");
  console.log(`✅ Total Compressed Images Uploaded: ${totalUploaded}`);
  if (totalErrors > 0) console.log(`⚠️ Errors Encountered: ${totalErrors}`);

  await mongoose.disconnect();
  process.exit(0);
}

uploadCompressedCatalogToCloudinary();
