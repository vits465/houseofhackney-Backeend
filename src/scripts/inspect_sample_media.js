import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import Product from "../modules/product/product/product.model.js";
import Category from "../modules/catalog/Category/category.model.js";
import ProductMedia from "../modules/product/product-media/productMedia.model.js";
import Media from "../modules/media/media.model.js";

async function inspectSampleMedia() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });

    const products = await Product.find({
        name: { $in: ["Zircon Paint", "Hollyhocks Wallpaper", "Sunseason Ceramic Candle", "Heavenly Hemp"] }
    }).populate("category").lean();

    for (const p of products) {
        console.log(`\n=================== ${p.name} (${p.productType}) Category: ${p.category?.name} ===================`);
        const pm = await ProductMedia.findOne({ product: p._id }).populate("gallery.media").populate("thumbnail").lean();
        console.log("Direct Thumbnail:", p.thumbnail);
        console.log("PM Thumbnail:", pm?.thumbnail?.secureUrl || pm?.thumbnail?.url);
        console.log("Gallery count:", pm?.gallery?.length);
        pm?.gallery?.forEach((item, idx) => {
            const m = item.media;
            console.log(`  [${idx + 1}] folder: "${m?.folder}", url: ${m?.secureUrl || m?.url}, alt: "${m?.altText}"`);
        });
    }

    await mongoose.disconnect();
}

inspectSampleMedia();
