import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import Product from "../modules/product/product/product.model.js";
import ProductPricing from "../modules/product/Pricing/pricing.model.js";
import ProductMedia from "../modules/product/product-media/productMedia.model.js";
import Category from "../modules/catalog/Category/category.model.js";
import Variant from "../modules/product/Variant/variant.model.js";
import Media from "../modules/media/media.model.js";

async function inspect() {
    try {
        let uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("MONGODB_URI is not set");
            process.exit(1);
        }
        await mongoose.connect(uri, { dbName: "house_of_hackney" });
        console.log("Connected to MongoDB successfully");

        // 1. Categories
        const categories = await Category.find({ deletedAt: null }).lean();
        console.log("\n=== CATEGORIES ===");
        categories.forEach(c => console.log(`_id: ${c._id}, name: "${c.name}", slug: "${c.slug}"`));

        // 2. Pricing Currency & Price Unit Sample
        const pricings = await ProductPricing.find({}).limit(5).lean();
        console.log("\n=== PRICING SAMPLES ===");
        console.log(JSON.stringify(pricings, null, 2));

        // 3. Inspect "Zircon Paint"
        const zircon = await Product.findOne({ name: /Zircon/i }).populate("category").lean();
        console.log("\n=== ZIRCON PRODUCT ===");
        console.log({
            _id: zircon?._id,
            name: zircon?.name,
            sku: zircon?.sku,
            productType: zircon?.productType,
            category: zircon?.category?.name,
            categorySlug: zircon?.category?.slug,
            thumbnail: zircon?.thumbnail,
            imagesCount: zircon?.images?.length
        });

        const zirconMedia = await ProductMedia.findOne({ product: zircon?._id }).populate("gallery.media").populate("thumbnail").lean();
        console.log("\n=== ZIRCON MEDIA ===");
        console.log("Thumbnail URL:", zirconMedia?.thumbnail?.secureUrl || zirconMedia?.thumbnail?.url);
        console.log("Gallery items:", zirconMedia?.gallery?.map(g => ({
            id: g._id,
            folder: g.media?.folder,
            secureUrl: g.media?.secureUrl,
            altText: g.media?.altText
        })));

        // 4. Products breakdown by productType
        const typeCounts = await Product.aggregate([
            { $group: { _id: "$productType", count: { $sum: 1 } } }
        ]);
        console.log("\n=== PRODUCT TYPES COUNT ===");
        console.log(typeCounts);

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error inspecting DB:", err);
        process.exit(1);
    }
}

inspect();
