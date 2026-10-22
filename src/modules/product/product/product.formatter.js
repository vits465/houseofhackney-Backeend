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

export function optimizeCloudinaryUrl(rawUrl, width = 800) {
    if (typeof rawUrl !== "string" || !rawUrl.includes("res.cloudinary.com")) {
        return rawUrl;
    }
    const trimmed = rawUrl.trim();
    if (trimmed.includes("/upload/c_") || trimmed.includes("/upload/w_") || trimmed.includes("/upload/f_auto")) {
        return trimmed;
    }
    return trimmed.replace("/upload/", `/upload/c_scale,w_${width},f_auto,q_auto/`);
}

const COLOR_SYNONYMS = {
    pink: ["blush", "rose", "dusky"],
    blush: ["pink", "rose", "dusky"],
    blue: ["azure", "petrol", "navy", "indigo"],
    azure: ["blue", "cyan"],
    petrol: ["blue", "teal"],
    green: ["moss", "botanical", "sage", "olive", "forest"],
    moss: ["green", "olive"],
    botanical: ["green", "flora"],
    black: ["midnight", "noir", "dark", "charcoal"],
    midnight: ["black", "dark"],
    white: ["dove", "cream", "ivory", "chalk"],
    cream: ["white", "ivory", "dove"],
    gold: ["yellow", "brass", "amber", "ochre"],
};

export function formatProduct(product, user = null) {
    if (!product) return null;

    const p = typeof product.toObject === "function" ? product.toObject({ virtuals: true }) : { ...product };

    const imagesSet = new Set();

    // 1. Existing direct product fields
    if (typeof p.thumbnail === "string" && p.thumbnail.trim()) {
        imagesSet.add(optimizeCloudinaryUrl(p.thumbnail.trim()));
    }

    if (Array.isArray(p.images)) {
        p.images.forEach((img) => {
            if (typeof img === "string" && img.trim()) {
                imagesSet.add(optimizeCloudinaryUrl(img.trim()));
            } else if (img && typeof img === "object") {
                const u = img.secureUrl || img.url;
                if (u && typeof u === "string") imagesSet.add(optimizeCloudinaryUrl(u.trim()));
            }
        });
    }

    // 2. ProductMedia relation
    const mediaThumbUrl = p.media?.thumbnail?.secureUrl || p.media?.thumbnail?.url || null;
    if (mediaThumbUrl) imagesSet.add(optimizeCloudinaryUrl(mediaThumbUrl));

    if (Array.isArray(p.media?.gallery)) {
        p.media.gallery.forEach((item) => {
            const u = item?.media?.secureUrl || item?.media?.url || item?.secureUrl || item?.url;
            if (u && typeof u === "string") imagesSet.add(optimizeCloudinaryUrl(u.trim()));
        });
    }

    // 3. Variants and their specific images and media
    const rawVariants = Array.isArray(p.variants) ? p.variants : [];
    const formattedVariants = rawVariants.map((v) => {
        const vObj = typeof v.toObject === "function" ? v.toObject({ virtuals: true }) : { ...v };

        const vImagesSet = new Set();

        // Check direct image property
        if (typeof vObj.image === "string" && vObj.image.trim()) {
            vImagesSet.add(optimizeCloudinaryUrl(vObj.image.trim()));
        }

        // Check thumbnail
        const vThumbUrl = vObj.thumbnail?.secureUrl || vObj.thumbnail?.url || null;
        if (vThumbUrl) vImagesSet.add(optimizeCloudinaryUrl(vThumbUrl));

        // Check images array
        if (Array.isArray(vObj.images)) {
            vObj.images.forEach((img) => {
                if (typeof img === "string" && img.trim()) {
                    vImagesSet.add(optimizeCloudinaryUrl(img.trim()));
                } else if (img && typeof img === "object") {
                    const u = img.secureUrl || img.url;
                    if (u && typeof u === "string") vImagesSet.add(optimizeCloudinaryUrl(u.trim()));
                }
            });
        }

        // Check gallery array
        if (Array.isArray(vObj.gallery)) {
            vObj.gallery.forEach((img) => {
                if (typeof img === "string" && img.trim()) {
                    vImagesSet.add(optimizeCloudinaryUrl(img.trim()));
                } else if (img && typeof img === "object") {
                    const u = img.secureUrl || img.url;
                    if (u && typeof u === "string") vImagesSet.add(optimizeCloudinaryUrl(u.trim()));
                }
            });
        }

        const vAllImages = Array.from(vImagesSet);
        const rawPrimary = vObj.image || vThumbUrl || vAllImages[0] || null;
        const primaryVImage = rawPrimary ? optimizeCloudinaryUrl(rawPrimary) : null;

        // Add to product's global image pool
        vAllImages.forEach((url) => imagesSet.add(url));

        const vThumbnail = vObj.thumbnail
            ? {
                  ...vObj.thumbnail,
                  secureUrl: optimizeCloudinaryUrl(vObj.thumbnail.secureUrl || vObj.thumbnail.url || primaryVImage),
                  url: optimizeCloudinaryUrl(vObj.thumbnail.url || vObj.thumbnail.secureUrl || primaryVImage),
              }
            : primaryVImage
            ? { secureUrl: primaryVImage, url: primaryVImage }
            : null;

        const vMedia = {
            thumbnail: vThumbnail,
            image: primaryVImage,
            images: vAllImages.length ? vAllImages : (primaryVImage ? [primaryVImage] : []),
            gallery: (Array.isArray(vObj.gallery) ? vObj.gallery : []).map((g) => {
                if (typeof g === "string") {
                    const opt = optimizeCloudinaryUrl(g);
                    return { secureUrl: opt, url: opt };
                }
                const u = g?.secureUrl || g?.url;
                return u ? { ...g, secureUrl: optimizeCloudinaryUrl(u), url: optimizeCloudinaryUrl(u) } : null;
            }).filter(Boolean),
        };

        return {
            ...vObj,
            thumbnail: vThumbnail,
            image: primaryVImage,
            images: vAllImages.length ? vAllImages : (primaryVImage ? [primaryVImage] : []),
            media: vMedia,
        };
    });

    const allImages = Array.from(imagesSet);

    // Determine primary thumbnail for product
    const rawThumb =
        (typeof p.thumbnail === "string" && p.thumbnail.trim()) ||
        mediaThumbUrl ||
        formattedVariants.find((v) => v.isDefault)?.image ||
        formattedVariants[0]?.image ||
        allImages[0] ||
        null;

    const primaryThumbnail = rawThumb ? optimizeCloudinaryUrl(rawThumb) : null;

    // Format Pricing
    const formattedPricing = p.pricing ? formatPricing(p.pricing, user) : null;

    // Format Inventory
    const formattedInventory = formatInventory(p.inventory);

    // Format Specifications
    const specifications = p.specifications || {};

    // Format Colours and link them to their respective variant and media
    const rawColours = Array.isArray(p.colours) ? p.colours : [];
    const formattedColours = rawColours.map((c) => {
        const cObj = typeof c.toObject === "function" ? c.toObject({ virtuals: true }) : { ...c };
        const cName = (cObj.name || "").trim().toLowerCase();
        const cSlug = (cObj.slug || "").trim().toLowerCase();
        const cWords = cName.split(/[\s-_]+/).filter((w) => w.length > 2);

        // Match variant by title, slug, attributes, or color keywords
        const matchingVariant = formattedVariants.find((v) => {
            const vTitle = (v.title || "").toLowerCase();
            const vSlug = (v.slug || "").toLowerCase();
            const attrValues = (v.attributes || []).map((a) => String(a.value || "").toLowerCase());

            const directMatch =
                vTitle.includes(cName) ||
                vSlug.includes(cSlug) ||
                attrValues.some((val) => val === cName || val.includes(cName) || cName.includes(val));

            if (cWords.some((w) => vTitle.includes(w) || vSlug.includes(w) || attrValues.some((val) => val.includes(w)))) {
                return true;
            }

            return cWords.some((w) => {
                const syns = COLOR_SYNONYMS[w] || [];
                return syns.some((syn) => vTitle.includes(syn) || vSlug.includes(syn) || attrValues.some((val) => val.includes(syn)));
            });
        });

        const colourImage = matchingVariant?.image || matchingVariant?.thumbnail?.secureUrl || null;
        const colourMedia = matchingVariant?.media || (colourImage ? { thumbnail: { secureUrl: colourImage, url: colourImage }, url: colourImage, secureUrl: colourImage } : null);

        return {
            ...cObj,
            image: colourImage,
            media: colourMedia,
            variantId: matchingVariant?._id || null,
        };
    });

    return {
        ...p,
        thumbnail: primaryThumbnail,
        images: allImages.length ? allImages : (primaryThumbnail ? [primaryThumbnail] : []),
        pricing: formattedPricing,
        inventory: formattedInventory,
        specifications,
        colours: formattedColours,
        variants: formattedVariants,
    };
}

export default formatProduct;
