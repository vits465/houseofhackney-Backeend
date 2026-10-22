import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import Product from "../modules/product/product/product.model.js";

async function check() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });
    const p = await Product.findById("6a76d063b4a90fc1d5c9b1f4").lean();
    console.log("Zircon record:", {
        _id: p?._id,
        name: p?.name,
        slug: p?.slug,
        status: p?.status,
        visibility: p?.visibility,
        deletedAt: p?.deletedAt,
        productType: p?.productType,
    });
    await mongoose.disconnect();
}

check();
