export const WISHLIST_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email phone displayName",
    },
    {
        path: "items.product",
        select: "name slug price thumbnail status shortDescription sku productType isFeatured isBestSeller",
    },
    {
        path: "items.variant",
        select: "title slug sku attributes position isDefault",
    },
];

export default WISHLIST_POPULATE;
