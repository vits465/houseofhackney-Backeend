import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import app from "../app.js";
import fs from "fs";

async function dumpSamples() {
    const port = 5056;
    const server = app.listen(port);
    const baseUrl = `http://127.0.0.1:${port}/api/v1`;

    async function get(path) {
        const res = await fetch(`${baseUrl}${path}`);
        return await res.json();
    }

    try {
        // 1. Wallpaper
        const wpRes = await get("/products?productType=WALLPAPER&limit=1");
        const wp = wpRes.data[0];
        const wpFull = await get(`/products/${wp._id}`);
        const wpMedia = await get(`/products/${wp._id}/media`);
        const wpPricing = await get(`/products/${wp._id}/pricing`);
        const wpSpecs = await get(`/products/${wp._id}/specifications`);
        const wpRelated = await get(`/products/${wp._id}/related`);

        // 2. Fabric
        const fabRes = await get("/products?productType=FABRIC&limit=1");
        const fab = fabRes.data[0];
        const fabFull = await get(`/products/${fab._id}`);
        const fabPricing = await get(`/products/${fab._id}/pricing`);
        const fabSpecs = await get(`/products/${fab._id}/specifications`);

        // 3. Paint & Homeware
        const paintFull = await get("/products/slug/zircon-paint");
        const paintPricing = await get(`/products/${paintFull.data._id}/pricing`);
        const paintSpecs = await get(`/products/${paintFull.data._id}/specifications`);

        const homewareRes = await get("/products?productType=HOMEWARE&limit=1");
        const homeware = homewareRes.data[0];
        const homewareFull = await get(`/products/${homeware._id}`);

        const result = {
            wallpaper: {
                details: wpFull,
                media: wpMedia,
                pricing: wpPricing,
                specifications: wpSpecs,
                related: wpRelated,
            },
            fabric: {
                details: fabFull,
                pricing: fabPricing,
                specifications: fabSpecs,
            },
            paint: {
                details: paintFull,
                pricing: paintPricing,
                specifications: paintSpecs,
            },
            homeware: {
                details: homewareFull,
            }
        };

        fs.writeFileSync("src/scripts/representative_responses.json", JSON.stringify(result, null, 2), "utf8");
        console.log("Saved representative sample responses to src/scripts/representative_responses.json");

    } finally {
        server.close();
        process.exit(0);
    }
}

dumpSamples();
