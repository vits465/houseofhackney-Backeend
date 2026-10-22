import fs from "fs";

const data = JSON.parse(fs.readFileSync("src/scripts/catalog_dump.json", "utf8"));

console.log("Total products:", data.length);

const byType = {};
const byCat = {};
const issues = [];

data.forEach(p => {
    byType[p.type] = (byType[p.type] || 0) + 1;
    byCat[p.cat] = (byCat[p.cat] || 0) + 1;

    const n = p.name.toLowerCase();

    // Check 1: Paint
    if (n.includes("paint") && (p.type !== "PAINT" || p.catSlug !== "paint")) {
        issues.push({ reason: "Paint product with wrong type or category", product: p });
    }

    // Check 2: Wallpaper / Wall mural
    if ((n.includes("wallpaper") || n.includes("wall mural")) && (p.type !== "WALLPAPER" || !p.catSlug.includes("wallpaper"))) {
        issues.push({ reason: "Wallpaper product with wrong type or category", product: p });
    }

    // Check 3: Lampshade / Lamp
    if ((n.includes("lampshade") || n.includes("lamp")) && p.type !== "LIGHTING") {
        issues.push({ reason: "Lighting product not typed LIGHTING", product: p });
    }

    // Check 4: Bottoman / Footstool / Sofa / Chair / Headboard
    if ((n.includes("bottoman") || n.includes("footstool") || n.includes("sofa") || n.includes("chair") || n.includes("headboard")) && p.type !== "FURNITURE") {
        issues.push({ reason: "Furniture product not typed FURNITURE", product: p });
    }

    // Check 5: Cushion / Platter / Mug / Pitcher / Vase
    if ((n.includes("cushion") || n.includes("platter") || n.includes("mug") || n.includes("pitcher") || n.includes("vase")) && (p.type === "WALLPAPER" || p.type === "FABRIC" || p.type === "PAINT")) {
        issues.push({ reason: "Home decor item misclassified as wallpaper/fabric/paint", product: p });
    }
});

console.log("\nProducts by Type:", byType);
console.log("\nProducts by Category:", byCat);
console.log("\nIdentified Issues:", issues.length);
issues.forEach((iss, idx) => {
    console.log(`${idx + 1}. [${iss.reason}] -> ID: ${iss.product.id}, Name: "${iss.product.name}", Type: ${iss.product.type}, Category: "${iss.product.cat}" (${iss.product.catSlug})`);
});
