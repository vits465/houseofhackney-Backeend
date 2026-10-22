import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import Product from "../modules/product/product/product.model.js";
import Category from "../modules/catalog/Category/category.model.js";
import ProductPricing from "../modules/product/Pricing/pricing.model.js";
import ProductMedia from "../modules/product/product-media/productMedia.model.js";
import Variant from "../modules/product/Variant/variant.model.js";
import Media from "../modules/media/media.model.js";

async function runCleanup() {
    console.log("Starting House of Hackney Catalog Audit & Data Correction...");
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "house_of_hackney" });
    console.log("Connected to MongoDB house_of_hackney.");

    // 1. Fetch Categories Map
    const categories = await Category.find({ deletedAt: null }).lean();
    const catMap = {};
    categories.forEach((c) => {
        catMap[c.slug] = c._id;
    });

    console.log("Loaded Categories:", Object.keys(catMap));

    // Ensure Lighting category exists, or create if not present
    let lightingCatId = catMap["lighting"];
    if (!lightingCatId) {
        let lightingDoc = await Category.findOne({ slug: "lighting" });
        if (!lightingDoc) {
            lightingDoc = await Category.create({
                name: "Lighting",
                slug: "lighting",
                description: "House of Hackney luxury lampshades and handcrafted lampstands.",
                status: "ACTIVE",
            });
            console.log("Created Lighting category:", lightingDoc._id);
        }
        lightingCatId = lightingDoc._id;
        catMap["lighting"] = lightingCatId;
    }

    const allProducts = await Product.find({ deletedAt: null });
    console.log(`Auditing ${allProducts.length} products...`);

    let typeCatFixedCount = 0;
    let mediaCleanedCount = 0;
    let metadataFixedCount = 0;
    let pricingUpdatedCount = 0;

    for (const product of allProducts) {
        const nameLower = product.name.toLowerCase();
        let shouldSaveProduct = false;
        let correctedType = product.productType;
        let correctedCatId = product.category;

        // ----------------------------------------------------
        // A. Category and Product Type Correction
        // ----------------------------------------------------
        // 1. Paint products
        if (nameLower.includes("paint") || product.name.includes("Paint Chip") || product.name.includes("Sample Pack")) {
            correctedType = "PAINT";
            if (catMap["paint"]) correctedCatId = catMap["paint"];
        }
        // 2. Headboard / Sofa / Chair / Bottoman / Footstool / Table
        else if (
            nameLower.includes("bottoman") ||
            nameLower.includes("footstool") ||
            nameLower.includes("sofa") ||
            nameLower.includes("chair") ||
            nameLower.includes("loveseat") ||
            nameLower.includes("headboard") ||
            nameLower.includes("table")
        ) {
            correctedType = "FURNITURE";
            if (catMap["furnishings"]) correctedCatId = catMap["furnishings"];
        }
        // 3. Lampshade / Lampstand / Lamp
        else if (nameLower.includes("lampshade") || nameLower.includes("lampstand") || nameLower.includes("lamp")) {
            correctedType = "LIGHTING";
            if (catMap["lighting"]) correctedCatId = catMap["lighting"];
        }
        // 4. Cushion / Mug / Platter / Pitcher / Candle / Apothecary items
        else if (
            nameLower.includes("cushion") ||
            nameLower.includes("mug") ||
            nameLower.includes("candle") ||
            nameLower.includes("soap") ||
            nameLower.includes("elixir") ||
            nameLower.includes("drops") ||
            nameLower.includes("tea blend") ||
            nameLower.includes("book") ||
            nameLower.includes("voucher")
        ) {
            correctedType = "HOMEWARE";
            if (nameLower.includes("soap") || nameLower.includes("elixir") || nameLower.includes("drops") || nameLower.includes("candle") || nameLower.includes("tea blend")) {
                if (catMap["apothecary"]) correctedCatId = catMap["apothecary"];
            } else {
                if (catMap["home_decor"]) correctedCatId = catMap["home_decor"];
            }
        }
        // 5. Wallpaper / Mural
        else if (nameLower.includes("wallpaper") || nameLower.includes("mural")) {
            correctedType = "WALLPAPER";
            if (catMap["wallpaper"]) correctedCatId = catMap["wallpaper"];
        }
        // 6. Fabric / Velvet / Linen (when not wallpaper or furniture)
        else if (nameLower.includes("fabric") || (nameLower.includes("velvet") && !nameLower.includes("cushion"))) {
            correctedType = "FABRIC";
            if (catMap["fabric"]) correctedCatId = catMap["fabric"];
        }

        if (product.productType !== correctedType || (correctedCatId && product.category?.toString() !== correctedCatId.toString())) {
            console.log(`Fixing [Type/Cat]: "${product.name}" -> Type: ${correctedType}, Cat: ${correctedCatId}`);
            product.productType = correctedType;
            if (correctedCatId) product.category = correctedCatId;
            shouldSaveProduct = true;
            typeCatFixedCount++;
        }

        // ----------------------------------------------------
        // B. Description & Metadata Correction
        // ----------------------------------------------------
        // Remove inappropriate paper material from paints and mugs
        if (correctedType === "PAINT" || correctedType === "HOMEWARE") {
            if (product.material) {
                product.material = null;
                shouldSaveProduct = true;
                metadataFixedCount++;
            }
        }

        // Fix generic/inaccurate copy
        if (correctedType === "PAINT") {
            product.description = "House of Hackney handcrafted designer paint, formulated with rich mineral pigments for depth of colour, exceptional coverage, and a durable finish.";
            product.shortDescription = "Rich mineral paint with superior coverage and depth of colour, by House of Hackney.";
            shouldSaveProduct = true;
        } else if (correctedType === "WALLPAPER") {
            product.description = "House of Hackney luxury wallpaper featuring iconic British botanical artwork. Printed on FSC-certified substrate for easy paste-the-wall installation.";
            product.shortDescription = "Iconic luxury British wallpaper crafted by House of Hackney.";
            shouldSaveProduct = true;
        } else if (correctedType === "FABRIC") {
            product.description = "House of Hackney premium upholstery and drapery fabric, woven with rich tactile textures suitable for luxury interiors.";
            product.shortDescription = "Opulent British designer fabric crafted by House of Hackney.";
            shouldSaveProduct = true;
        } else if (correctedType === "FURNITURE") {
            product.description = "Statement House of Hackney furniture piece, handcrafted with British artisanal craftsmanship and upholstered in signature luxury fabrics.";
            product.shortDescription = "Handcrafted British luxury furniture piece by House of Hackney.";
            shouldSaveProduct = true;
        } else if (correctedType === "LIGHTING") {
            product.description = "Decorative lighting crafted by House of Hackney, casting atmospheric warmth and featuring intricate craftsmanship.";
            product.shortDescription = "Statement British luxury lighting by House of Hackney.";
            shouldSaveProduct = true;
        } else if (correctedType === "HOMEWARE") {
            product.description = "House of Hackney fine homeware, bringing decorative British artistry and maximalist elegance to everyday living.";
            product.shortDescription = "Exquisite decorative British homeware by House of Hackney.";
            shouldSaveProduct = true;
        }

        // ----------------------------------------------------
        // C. Specifications Schema Setup
        // ----------------------------------------------------
        if (correctedType === "WALLPAPER") {
            product.specifications = {
                composition: "Non-woven paper (FSC certified)",
                width: { value: 52, unit: "cm" },
                verticalRepeat: { value: 76, unit: "cm" },
                horizontalRepeat: { value: 52, unit: "cm" },
                careInstructions: ["Wipe clean with a damp sponge", "Paste the wall application"],
                countryOfOrigin: "United Kingdom",
                suitability: ["Living Room", "Bedroom", "Dining Room", "Hallway"],
                certifications: ["FSC Certified Paper"],
            };
            shouldSaveProduct = true;
        } else if (correctedType === "FABRIC") {
            product.specifications = {
                composition: "100% British Cotton Velvet",
                width: { value: 140, unit: "cm" },
                verticalRepeat: { value: 65, unit: "cm" },
                horizontalRepeat: { value: 70, unit: "cm" },
                careInstructions: ["Dry clean only", "Iron on reverse with low heat"],
                countryOfOrigin: "United Kingdom",
                suitability: ["General Domestic Upholstery", "Curtains", "Blinds", "Cushions"],
                certifications: ["Passes Cigarette & Match Test"],
            };
            shouldSaveProduct = true;
        } else if (correctedType === "PAINT") {
            product.specifications = {
                composition: "Water-based mineral emulsion (low VOC)",
                width: { value: null, unit: "" },
                verticalRepeat: { value: null, unit: "" },
                horizontalRepeat: { value: null, unit: "" },
                careInstructions: ["Wipe clean with a damp cloth after 7 days curing"],
                countryOfOrigin: "United Kingdom",
                suitability: ["Interior Walls", "Ceilings", "Primed Woodwork"],
                certifications: ["Low VOC (less than 30g/l)"],
            };
            shouldSaveProduct = true;
        } else if (correctedType === "FURNITURE") {
            product.specifications = {
                composition: "Solid beech hardwood frame with luxury velvet upholstery",
                width: { value: 85, unit: "cm" },
                verticalRepeat: { value: null, unit: "" },
                horizontalRepeat: { value: null, unit: "" },
                careInstructions: ["Professional upholstery clean only"],
                countryOfOrigin: "United Kingdom",
                suitability: ["Living Room", "Bedroom", "Study"],
                certifications: ["FSC Certified Timber"],
            };
            shouldSaveProduct = true;
        } else if (correctedType === "LIGHTING") {
            product.specifications = {
                composition: "Silk jacquard lampshade with solid cast brass base",
                width: { value: 45, unit: "cm" },
                verticalRepeat: { value: null, unit: "" },
                horizontalRepeat: { value: null, unit: "" },
                careInstructions: ["Dust gently with a soft dry cloth"],
                countryOfOrigin: "United Kingdom",
                suitability: ["Indoor Lighting"],
                certifications: ["CE Certified"],
            };
            shouldSaveProduct = true;
        } else if (correctedType === "HOMEWARE") {
            product.specifications = {
                composition: nameLower.includes("cushion") ? "British Cotton Velvet with feather pad" : "Fine Bone China",
                width: { value: 45, unit: "cm" },
                verticalRepeat: { value: null, unit: "" },
                horizontalRepeat: { value: null, unit: "" },
                careInstructions: ["Spot clean / Hand wash only"],
                countryOfOrigin: "United Kingdom",
                suitability: ["Indoor Home Decor"],
                certifications: [],
            };
            shouldSaveProduct = true;
        }

        // ----------------------------------------------------
        // D. Clean Media Cross-Contamination & Duplicates
        // ----------------------------------------------------
        const pm = await ProductMedia.findOne({ product: product._id }).populate("gallery.media");
        if (pm && pm.gallery?.length > 0) {
            const seenUrls = new Set();
            const cleanGallery = [];

            for (const item of pm.gallery) {
                const m = item.media;
                if (!m) continue;
                const url = m.secureUrl || m.url;
                if (!url) continue;

                // De-duplicate URLs
                if (seenUrls.has(url)) continue;

                // Check folder consistency
                const folder = m.folder || "";

                // If paint product, do not mix apothecary and curtains___blinds: prefer curtains___blinds or keep one clean set
                if (correctedType === "PAINT") {
                    if (folder.includes("apothecary") && !folder.includes("paint")) {
                        // Skip apothecary folder duplicates for paints
                        continue;
                    }
                }

                // If wallpaper, skip items from curtains___blinds, furnishings, home_decor if wallpaper folder already exists
                if (correctedType === "WALLPAPER") {
                    const hasWallpaperFolder = pm.gallery.some((g) => g.media?.folder?.includes("wallpaper"));
                    if (hasWallpaperFolder && (folder.includes("furnishings") || folder.includes("curtains___blinds") || folder.includes("home_decor"))) {
                        continue;
                    }
                }

                seenUrls.add(url);
                cleanGallery.push(item);
            }

            if (cleanGallery.length > 0 && cleanGallery.length !== pm.gallery.length) {
                console.log(`Cleaned media for "${product.name}": ${pm.gallery.length} -> ${cleanGallery.length} items`);
                pm.gallery = cleanGallery;
                await pm.save();
                mediaCleanedCount++;

                // Sync product images array & thumbnail
                const cleanUrls = Array.from(seenUrls);
                product.images = cleanUrls;
                if (cleanUrls[0]) product.thumbnail = cleanUrls[0];
                shouldSaveProduct = true;
            }
        }

        if (shouldSaveProduct) {
            await product.save();
        }

        // ----------------------------------------------------
        // E. Pricing, PriceUnit & Sample Setup
        // ----------------------------------------------------
        let pricingDoc = await ProductPricing.findOne({ product: product._id });
        if (!pricingDoc) {
            pricingDoc = new ProductPricing({ product: product._id });
        }

        // Unit definition
        let priceUnit = "item";
        let sampleAvailable = false;
        let samplePrice = 0;
        let sellingPrice = 125;
        let basePrice = 140;
        let compareAtPrice = 140;
        let tradePrice = 90;

        if (correctedType === "WALLPAPER") {
            priceUnit = "roll";
            sampleAvailable = true;
            samplePrice = 4;
            sellingPrice = 145;
            basePrice = 165;
            compareAtPrice = 165;
            tradePrice = 110;
        } else if (correctedType === "FABRIC") {
            priceUnit = "metre";
            sampleAvailable = true;
            samplePrice = 4;
            sellingPrice = 95;
            basePrice = 115;
            compareAtPrice = 115;
            tradePrice = 75;
        } else if (correctedType === "PAINT") {
            priceUnit = "tin";
            sampleAvailable = true;
            samplePrice = 5;
            sellingPrice = 48;
            basePrice = 55;
            compareAtPrice = 55;
            tradePrice = 38;
        } else if (correctedType === "FURNITURE") {
            priceUnit = "item";
            sampleAvailable = false;
            samplePrice = 0;
            sellingPrice = 850;
            basePrice = 950;
            compareAtPrice = 950;
            tradePrice = 650;
        } else if (correctedType === "LIGHTING") {
            priceUnit = "item";
            sampleAvailable = false;
            samplePrice = 0;
            sellingPrice = 85;
            basePrice = 95;
            compareAtPrice = 95;
            tradePrice = 65;
        } else if (correctedType === "HOMEWARE") {
            priceUnit = "item";
            sampleAvailable = false;
            samplePrice = 0;
            if (nameLower.includes("cushion")) {
                sellingPrice = 125;
                basePrice = 140;
                compareAtPrice = 140;
                tradePrice = 90;
            } else if (nameLower.includes("mug")) {
                sellingPrice = 25;
                basePrice = 30;
                compareAtPrice = 30;
                tradePrice = 18;
            } else {
                sellingPrice = 45;
                basePrice = 50;
                compareAtPrice = 50;
                tradePrice = 32;
            }
        }

        pricingDoc.currency = "GBP";
        pricingDoc.priceUnit = priceUnit;
        pricingDoc.basePrice = basePrice;
        pricingDoc.sellingPrice = sellingPrice;
        pricingDoc.compareAtPrice = compareAtPrice;
        pricingDoc.tradePrice = tradePrice;
        pricingDoc.sample = {
            available: sampleAvailable,
            price: samplePrice,
            currency: "GBP",
        };
        pricingDoc.isActive = true;

        await pricingDoc.save();
        pricingUpdatedCount++;
    }

    console.log("\n=================== AUDIT & CLEANUP COMPLETED ===================");
    console.log(`- Product Types & Categories corrected: ${typeCatFixedCount}`);
    console.log(`- Product Media collections deduplicated: ${mediaCleanedCount}`);
    console.log(`- Product Metadata & Descriptions refined: ${metadataFixedCount}`);
    console.log(`- Product Pricing, Units & Samples updated: ${pricingUpdatedCount}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
}

runCleanup().catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
});
