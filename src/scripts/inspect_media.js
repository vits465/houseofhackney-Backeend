import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import Product from "../modules/product/product/product.model.js";
import ProductMedia from "../modules/product/product-media/productMedia.model.js";
import Media from "../modules/media/media.model.js";

async function inspectMedia() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });
    const productMediaList = await ProductMedia.find({ deletedAt: null }).populate("gallery.media").populate("product").lean();

    console.log(`Total ProductMedia records: ${productMediaList.length}`);

    const crossFolderContaminated = [];

    for (const pm of productMediaList) {
        if (!pm.product) continue;
        const folders = new Set();
        const urls = new Set();
        let duplicates = 0;

        for (const item of (pm.gallery || [])) {
            const m = item.media;
            if (m) {
                if (m.folder) folders.add(m.folder);
                const url = m.secureUrl || m.url;
                if (url) {
                    if (urls.has(url)) duplicates++;
                    urls.add(url);
                }
            }
        }

        // Check if multiple root categories in folders (e.g., curtains___blinds AND apothecary)
        const rootFolders = new Set(Array.from(folders).map(f => f.split("/")[1] || f));
        if (rootFolders.size > 1 || duplicates > 0) {
            crossFolderContaminated.push({
                productId: pm.product._id,
                productName: pm.product.name,
                productType: pm.product.productType,
                rootFolders: Array.from(rootFolders),
                galleryCount: pm.gallery?.length,
                uniqueUrls: urls.size,
                duplicates,
            });
        }
    }

    console.log("\n=== CROSS-FOLDER / DUPLICATE CONTAMINATED MEDIA ===", crossFolderContaminated.length);
    console.log(JSON.stringify(crossFolderContaminated, null, 2));

    await mongoose.disconnect();
}

inspectMedia();
