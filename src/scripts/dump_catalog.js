import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import fs from "fs";

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import Product from "../modules/product/product/product.model.js";
import Category from "../modules/catalog/Category/category.model.js";

async function dumpCatalog() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });
    const products = await Product.find({ deletedAt: null }).populate("category").lean();
    
    const catalog = products.map(p => ({
        id: p._id.toString(),
        name: p.name,
        sku: p.sku,
        type: p.productType,
        cat: p.category?.name || "None",
        catSlug: p.category?.slug || "none",
    }));

    fs.writeFileSync("src/scripts/catalog_dump.json", JSON.stringify(catalog, null, 2), "utf8");
    console.log(`Saved ${catalog.length} products to catalog_dump.json`);
    await mongoose.disconnect();
}

dumpCatalog();
