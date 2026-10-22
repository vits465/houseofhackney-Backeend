import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import ProductSpecification from "../modules/product/specification/specification.model.js";

async function checkSpecs() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });
    const count = await ProductSpecification.countDocuments({});
    console.log(`ProductSpecification count: ${count}`);
    const samples = await ProductSpecification.find({}).limit(3).lean();
    console.log(JSON.stringify(samples, null, 2));
    await mongoose.disconnect();
}

checkSpecs();
