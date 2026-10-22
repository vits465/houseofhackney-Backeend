import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import Product from "../modules/product/product/product.model.js";
import ProductMedia from "../modules/product/product-media/productMedia.model.js";
import Media from "../modules/media/media.model.js";
import Category from "../modules/catalog/Category/category.model.js";

async function inspectPaintFolders() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });

    const paints = await Product.find({ name: /Paint/i }).lean();
    console.log(`Found ${paints.length} products with "Paint" in name:`);

    for (const p of paints) {
        const pm = await ProductMedia.findOne({ product: p._id }).populate("gallery.media").lean();
        const folders = new Set();
        (pm?.gallery || []).forEach(g => {
            if (g.media?.folder) folders.add(g.media.folder);
        });
        console.log(`- ${p.name}: [${p.productType}] Folders: ${Array.from(folders).join(", ")}`);
    }

    await mongoose.disconnect();
}

inspectPaintFolders();
