import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });

import app from "../app.js";

async function runTests() {
    console.log("=== STARTING BACKEND API VERIFICATION SUITE ===");

    const port = 5055;
    const server = app.listen(port, () => {
        console.log(`Test server running on http://127.0.0.1:${port}`);
    });

    const baseUrl = `http://127.0.0.1:${port}/api/v1`;

    async function get(path, headers = {}) {
        const res = await fetch(`${baseUrl}${path}`, { headers });
        const data = await res.json().catch(() => null);
        return { status: res.status, data };
    }

    try {
        // Test 1: Fetch Product Listing
        console.log("\n[Test 1] GET /products");
        const listRes = await get("/products?page=1&limit=5");
        console.log(`Status: ${listRes.status}`);
        console.log(`Success: ${listRes.data?.success}, Total: ${listRes.data?.pagination?.total}, Page items: ${listRes.data?.data?.length}`);
        if (!listRes.data?.success || !listRes.data?.pagination) throw new Error("Product listing failed");

        // Pick a product for subsequent tests
        const sampleProduct = listRes.data.data[0];
        const sampleId = sampleProduct._id;
        const sampleSlug = sampleProduct.slug;
        console.log(`Sample product selected: "${sampleProduct.name}" (ID: ${sampleId}, Slug: ${sampleSlug})`);

        // Test 2: Fetch Product by ID
        console.log(`\n[Test 2] GET /products/${sampleId}`);
        const idRes = await get(`/products/${sampleId}`);
        console.log(`Status: ${idRes.status}, Product name: "${idRes.data?.data?.name}"`);
        if (idRes.status !== 200 || !idRes.data?.data?.pricing) throw new Error("Get by ID failed");

        // Test 3: Fetch Product by Slug
        console.log(`\n[Test 3] GET /products/slug/${sampleSlug}`);
        const slugRes = await get(`/products/slug/${sampleSlug}`);
        console.log(`Status: ${slugRes.status}, Product slug: "${slugRes.data?.data?.slug}"`);
        if (slugRes.status !== 200) throw new Error("Get by slug failed");

        // Test 4: Fetch Product Media
        console.log(`\n[Test 4] GET /products/${sampleId}/media`);
        const mediaRes = await get(`/products/${sampleId}/media`);
        console.log(`Status: ${mediaRes.status}`);
        console.log(`Thumbnail: ${mediaRes.data?.data?.thumbnail?.secureUrl || mediaRes.data?.data?.thumbnail?.url}`);
        console.log(`Gallery items count: ${mediaRes.data?.data?.gallery?.length}`);
        if (mediaRes.status !== 200 || !mediaRes.data?.data?.gallery) throw new Error("Get media failed");

        // Test 5: Fetch Product Variants
        console.log(`\n[Test 5a] GET /variants/product/${sampleId}`);
        const varResA = await get(`/variants/product/${sampleId}`);
        console.log(`Status: ${varResA.status}, Variants count: ${varResA.data?.data?.length}`);

        console.log(`[Test 5b] GET /products/${sampleId}/variants`);
        const varResB = await get(`/products/${sampleId}/variants`);
        console.log(`Status: ${varResB.status}, Variants count: ${varResB.data?.data?.length}`);
        if (varResA.status !== 200 || varResB.status !== 200) throw new Error("Get variants failed");

        // Test 6: Fetch Pricing & Price Unit
        console.log(`\n[Test 6] GET /products/${sampleId}/pricing`);
        const pricingRes = await get(`/products/${sampleId}/pricing`);
        console.log(`Status: ${pricingRes.status}`);
        console.log(`Currency: ${pricingRes.data?.data?.currency}, Unit: ${pricingRes.data?.data?.priceUnit}, Selling: ${pricingRes.data?.data?.sellingPrice}, Sample:`, pricingRes.data?.data?.sample);
        if (pricingRes.status !== 200 || !pricingRes.data?.data?.priceUnit) throw new Error("Get pricing failed");

        // Test 7: Fetch Specifications
        console.log(`\n[Test 7] GET /products/${sampleId}/specifications`);
        const specsRes = await get(`/products/${sampleId}/specifications`);
        console.log(`Status: ${specsRes.status}`);
        console.log(`Specifications:`, specsRes.data?.data);
        if (specsRes.status !== 200) throw new Error("Get specifications failed");

        // Test 8: Fetch Related Products
        console.log(`\n[Test 8] GET /products/${sampleId}/related`);
        const relRes = await get(`/products/${sampleId}/related`);
        console.log(`Status: ${relRes.status}, Related items count: ${relRes.data?.data?.length}`);
        if (relRes.status !== 200) throw new Error("Get related failed");

        // Test 9: Trade pricing protection
        console.log(`\n[Test 9] Verify trade price is hidden from public`);
        console.log(`Public pricing tradePrice:`, pricingRes.data?.data?.tradePrice);
        if (pricingRes.data?.data?.tradePrice !== undefined) {
            throw new Error("Security check failed: tradePrice exposed to unauthenticated public request!");
        } else {
            console.log("PASS: tradePrice is securely omitted from unauthenticated responses.");
        }

        // Test 10: Invalid IDs & Missing Products
        console.log(`\n[Test 10] Testing Invalid IDs & 404 handling`);
        const invalidIdRes = await get("/products/non_existent_id_12345");
        console.log(`Invalid ID status: ${invalidIdRes.status}`);
        const invalidMediaRes = await get("/products/6a76d0000000000000000000/media");
        console.log(`Missing product media status: ${invalidMediaRes.status}`);
        if (invalidIdRes.status !== 404 || invalidMediaRes.status !== 404) {
            throw new Error("404 validation failed for non-existent products");
        }

        // Test 11: Zircon Paint Verification
        console.log(`\n[Test 11] Auditing Zircon Paint record`);
        const zirconRes = await get("/products/slug/zircon-paint");
        const zircon = zirconRes.data?.data;
        console.log(`Zircon Type: ${zircon?.productType} (Expected: PAINT)`);
        console.log(`Zircon Category: ${zircon?.category?.name || zircon?.category} (Expected: Paint)`);
        console.log(`Zircon Price Unit: ${zircon?.pricing?.priceUnit} (Expected: tin)`);
        console.log(`Zircon Sample:`, zircon?.pricing?.sample);
        console.log(`Zircon Images count: ${zircon?.images?.length}`);
        if (zircon?.productType !== "PAINT" || zircon?.pricing?.priceUnit !== "tin") {
            throw new Error("Zircon Paint audit failed");
        }

        // Test 12: Pagination & Filtering
        console.log(`\n[Test 12] Pagination, Filtering & Sorting`);
        const paintFilterRes = await get("/products?productType=PAINT");
        console.log(`Paint filter count: ${paintFilterRes.data?.data?.length}`);

        const catFilterRes = await get("/products?category=wallpaper");
        console.log(`Wallpaper category filter count: ${catFilterRes.data?.data?.length}`);

        const sortRes = await get("/products?sort=newest&limit=3");
        console.log(`Sort newest top 3:`, sortRes.data?.data?.map(p => p.name));

        console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<");

    } catch (err) {
        console.error("Test Suite Error:", err);
    } finally {
        server.close();
        process.exit(0);
    }
}

runTests();
