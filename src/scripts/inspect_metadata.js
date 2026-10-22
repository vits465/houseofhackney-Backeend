import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import Product from "../modules/product/product/product.model.js";
import Material from "../modules/catalog/material/material.model.js";
import Category from "../modules/catalog/Category/category.model.js";

async function inspectMetadata() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });

    // Inspect materials
    const materials = await Material.find({}).lean();
    console.log("=== MATERIALS ===");
    materials.forEach(m => console.log(`- ${m.name} (${m._id})`));

    // Inspect some descriptions for Paint, Wallpaper, Homeware, Furniture
    const sampleProducts = await Product.find({
        name: { $in: ["Zircon Paint", "Wonder Garden Ceramic Mug", "Artemis Velvet Castle Chair", "Artemis Wallpaper"] }
    }).populate("material").populate("category").lean();

    console.log("\n=== SAMPLE PRODUCT METADATA ===");
    for (const p of sampleProducts) {
        console.log(`\nProduct: "${p.name}" (${p.productType})`);
        console.log(`Material:`, p.material?.name || "None");
        console.log(`Short Description:`, p.shortDescription);
        console.log(`Description preview:`, p.description?.substring(0, 150));
    }

    await mongoose.disconnect();
}

inspectMetadata();
