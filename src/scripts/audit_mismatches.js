import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import Product from "../modules/product/product/product.model.js";
import Category from "../modules/catalog/Category/category.model.js";
import Variant from "../modules/product/Variant/variant.model.js";
import ProductPricing from "../modules/product/Pricing/pricing.model.js";
import ProductMedia from "../modules/product/product-media/productMedia.model.js";

async function audit() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });
    const products = await Product.find({ deletedAt: null }).populate("category").lean();
    console.log(`Total products: ${products.length}`);

    const mismatches = [];
    const paintInWrongCat = [];
    const wallpaperInWrongCat = [];
    const fabricInWrongCat = [];

    for (const p of products) {
        const catName = p.category?.name || "None";
        const catSlug = p.category?.slug || "none";
        const nameLower = p.name.toLowerCase();

        const isPaint = nameLower.includes("paint");
        const isWallpaper = nameLower.includes("wallpaper") || nameLower.includes("mural");
        const isFabric = nameLower.includes("fabric") || nameLower.includes("velvet") && !isWallpaper && !isPaint;
        const isLampshade = nameLower.includes("lampshade") || nameLower.includes("lamp");
        const isCushion = nameLower.includes("cushion");
        const isCurtain = nameLower.includes("curtain") || nameLower.includes("blind");

        if (isPaint && (p.productType !== "PAINT" || catSlug !== "paint")) {
            paintInWrongCat.push({ id: p._id, name: p.name, currentType: p.productType, catName, catSlug });
        }
        if (isWallpaper && (p.productType !== "WALLPAPER" || !catSlug.includes("wallpaper"))) {
            wallpaperInWrongCat.push({ id: p._id, name: p.name, currentType: p.productType, catName, catSlug });
        }
        if (isFabric && (p.productType !== "FABRIC" || catSlug !== "fabric")) {
            fabricInWrongCat.push({ id: p._id, name: p.name, currentType: p.productType, catName, catSlug });
        }
    }

    console.log("\n=== PAINT MISMATCHES ===", paintInWrongCat.length);
    console.log(paintInWrongCat);

    console.log("\n=== WALLPAPER MISMATCHES ===", wallpaperInWrongCat.length);
    console.log(wallpaperInWrongCat);

    console.log("\n=== FABRIC MISMATCHES ===", fabricInWrongCat.length);
    console.log(fabricInWrongCat);

    await mongoose.disconnect();
}

audit();
