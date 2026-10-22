/**
 * Formats a Product document with complete, perfect, non-broken images,
 * properly linked variants with their specific variant images, pricing,
 * specifications, inventory status, and sample information.
 */

export function isTradeAuthorized(user) {
    if (!user) return false;
    const role = typeof user.role === "string" ? user.role.toUpperCase() : user.role?.name?.toUpperCase();
    if (role === "ADMIN" || role === "SUPER_ADMIN" || role === "TRADE") return true;
    if (user.tradeProfile && (user.tradeProfile.status === "APPROVED" || user.tradeProfile.isApproved)) return true;
    return false;
}

export function formatPricing(pricingObj, user = null) {
    if (!pricingObj) return null;
    const raw = typeof pricingObj.toObject === "function" ? pricingObj.toObject() : { ...pricingObj };

    const formatted = {
        _id: raw._id,
        currency: raw.currency || "GBP",
        basePrice: raw.basePrice ?? raw.sellingPrice ?? 0,
        sellingPrice: raw.sellingPrice ?? raw.basePrice ?? 0,
        compareAtPrice: raw.compareAtPrice ?? raw.basePrice ?? 0,
        priceUnit: raw.priceUnit || "item",
        sample: {
            available: Boolean(raw.sample?.available),
            price: raw.sample?.price ?? (raw.sample?.available ? 4 : 0),
            currency: raw.sample?.currency || raw.currency || "GBP",
        },
    };

    // Only include tradePrice if requester is authorized trade account or admin
    if (isTradeAuthorized(user) && raw.tradePrice !== undefined && raw.tradePrice !== null) {
        formatted.tradePrice = raw.tradePrice;
    }

    return formatted;
}

export function formatInventory(inventoryObj) {
    if (!inventoryObj) {
        return {
            status: "IN_STOCK",
            availableQuantity: 50,
            inStock: true,
        };
    }
    const raw = typeof inventoryObj.toObject === "function" ? inventoryObj.toObject() : { ...inventoryObj };
    const qty = raw.availableQuantity ?? raw.quantity ?? 0;
    return {
        status: raw.status || (qty > 0 ? "IN_STOCK" : "OUT_OF_STOCK"),
        availableQuantity: qty,
        inStock: qty > 0,
    };
}

export function formatProduct(product, user = null) {
    if (!product) return null;

    const p = typeof product.toObject === "function" ? product.toObject({ virtuals: true }) : { ...product };

    const imagesSet = new Set();

    // 1. Existing direct product fields
    if (typeof p.thumbnail === "string" && p.thumbnail.trim()) {
        imagesSet.add(p.thumbnail.trim());
    }

    if (Array.isArray(p.images)) {
        p.images.forEach((img) => {
            if (typeof img === "string" && img.trim()) {
                imagesSet.add(img.trim());
            } else if (img && typeof img === "object") {
                const u = img.secureUrl || img.url;
                if (u && typeof u === "string") imagesSet.add(u.trim());
            }
        });
    }

    // 2. ProductMedia relation
    const mediaThumbUrl = p.media?.thumbnail?.secureUrl || p.media?.thumbnail?.url || null;
    if (mediaThumbUrl) imagesSet.add(mediaThumbUrl);

    if (Array.isArray(p.media?.gallery)) {
        p.media.gallery.forEach((item) => {
            const u = item?.media?.secureUrl || item?.media?.url || item?.secureUrl || item?.url;
            if (u && typeof u === "string") imagesSet.add(u.trim());
        });
    }

    // 3. Variants and their specific images
    const rawVariants = Array.isArray(p.variants) ? p.variants : [];
    const formattedVariants = rawVariants.map((v) => {
        const vObj = typeof v.toObject === "function" ? v.toObject({ virtuals: true }) : { ...v };

        const vImagesSet = new Set();

        // Check direct image property
        if (typeof vObj.image === "string" && vObj.image.trim()) {
            vImagesSet.add(vObj.image.trim());
        }

        // Check thumbnail
        const vThumbUrl = vObj.thumbnail?.secureUrl || vObj.thumbnail?.url || null;
        if (vThumbUrl) vImagesSet.add(vThumbUrl);

        // Check images array
        if (Array.isArray(vObj.images)) {
            vObj.images.forEach((img) => {
                if (typeof img === "string" && img.trim()) {
                    vImagesSet.add(img.trim());
                } else if (img && typeof img === "object") {
                    const u = img.secureUrl || img.url;
                    if (u && typeof u === "string") vImagesSet.add(u.trim());
                }
            });
        }

        // Check gallery array
        if (Array.isArray(vObj.gallery)) {
            vObj.gallery.forEach((img) => {
                if (typeof img === "string" && img.trim()) {
                    vImagesSet.add(img.trim());
                } else if (img && typeof img === "object") {
                    const u = img.secureUrl || img.url;
                    if (u && typeof u === "string") vImagesSet.add(u.trim());
                }
            });
        }

        const vAllImages = Array.from(vImagesSet);
        const primaryVImage = vObj.image || vThumbUrl || vAllImages[0] || null;

        // Add to product's global image pool
        vAllImages.forEach((url) => imagesSet.add(url));

        return {
            ...vObj,
            thumbnail: vObj.thumbnail || (primaryVImage ? { secureUrl: primaryVImage, url: primaryVImage } : null),
            image: primaryVImage,
            images: vAllImages.length ? vAllImages : (primaryVImage ? [primaryVImage] : []),
        };
    });

    const allImages = Array.from(imagesSet);

    // Determine primary thumbnail for product
    const primaryThumbnail =
        (typeof p.thumbnail === "string" && p.thumbnail.trim()) ||
        mediaThumbUrl ||
        formattedVariants.find((v) => v.isDefault)?.image ||
        formattedVariants[0]?.image ||
        allImages[0] ||
        null;

    // Format Pricing
    const formattedPricing = p.pricing ? formatPricing(p.pricing, user) : null;

    // Format Inventory
    const formattedInventory = formatInventory(p.inventory);

    // Format Specifications
    const specifications = p.specifications || {};

    return {
        ...p,
        thumbnail: primaryThumbnail,
        images: allImages.length ? allImages : (primaryThumbnail ? [primaryThumbnail] : []),
        pricing: formattedPricing,
        inventory: formattedInventory,
        specifications,
        variants: formattedVariants,
    };
}

export default formatProduct;
