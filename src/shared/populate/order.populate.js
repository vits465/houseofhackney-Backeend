export const ORDER_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email phone displayName accountType isTradeAccount",
    },
    {
        path: "items.product",
        select: "name slug sku productType status shortDescription",
    },
    {
        path: "items.variant",
        select: "title slug sku attributes position isDefault weight dimensions",
    },
    {
        path: "createdBy",
        select: "firstName lastName email displayName",
    },
    {
        path: "updatedBy",
        select: "firstName lastName email displayName",
    },
];

export default ORDER_POPULATE;
