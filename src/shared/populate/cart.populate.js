export const CART_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email phone displayName",
    },
    {
        path: "items.product",
        select: "name slug sku thumbnail productType status shortDescription",
    },
    {
        path: "items.variant",
        select: "title slug sku attributes",
    },
];

export default CART_POPULATE;
