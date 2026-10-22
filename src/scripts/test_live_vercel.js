import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const baseUrl = "https://houseofhackney-backeend.vercel.app/api/v1";

async function testLive() {
    console.log("Testing Live Vercel API:", baseUrl);

    try {
        // 1. Products listing
        const resList = await fetch(`${baseUrl}/products?limit=2`);
        const listData = await resList.json();
        console.log(`Live /products Status: ${resList.status}, Success: ${listData.success}, Total: ${listData.pagination?.total}`);

        // 2. Zircon Paint lookup by slug
        const resZircon = await fetch(`${baseUrl}/products/slug/zircon-paint`);
        const zirconData = await resZircon.json();
        console.log(`Live Zircon Paint: Status: ${resZircon.status}, Type: ${zirconData.data?.productType}, Category: ${zirconData.data?.category?.name}, Unit: ${zirconData.data?.pricing?.priceUnit}`);

        // 3. Pricing endpoint
        const sampleId = listData.data[0]._id;
        const resPricing = await fetch(`${baseUrl}/products/${sampleId}/pricing`);
        const pricingData = await resPricing.json();
        console.log(`Live Pricing Status: ${resPricing.status}, Currency: ${pricingData.data?.currency}, Unit: ${pricingData.data?.priceUnit}, Sample:`, pricingData.data?.sample);

        // 4. Specifications endpoint
        const resSpecs = await fetch(`${baseUrl}/products/${sampleId}/specifications`);
        const specsData = await resSpecs.json();
        console.log(`Live Specs Status: ${resSpecs.status}, Specs:`, specsData.data);

        // 5. Related endpoint
        const resRel = await fetch(`${baseUrl}/products/${sampleId}/related`);
        const relData = await resRel.json();
        console.log(`Live Related Status: ${resRel.status}, Items: ${relData.data?.length}`);

        console.log("LIVE VERIFICATION COMPLETE!");
    } catch (err) {
        console.error("Live test error:", err.message);
    }
}

testLive();
