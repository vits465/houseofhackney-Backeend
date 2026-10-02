export const TRADE_PROFILE_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email phone displayName accountType isTradeAccount",
    },
    {
        path: "company",
    },
    {
        path: "tier",
        select: "name discountPercentage creditLimit minOrderAmount maxCreditPeriod status",
    },
    {
        path: "approvedBy",
        select: "firstName lastName email displayName",
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

export const TRADE_PRICING_POPULATE = [
    {
        path: "product",
        select: "name slug sku productType status",
    },
    {
        path: "variant",
        select: "title slug sku attributes",
    },
    {
        path: "tradeTier",
        select: "name discountPercentage creditLimit minOrderAmount maxCreditPeriod status",
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

export const QUOTATION_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email phone displayName",
    },
    {
        path: "company",
    },
    {
        path: "convertedOrder",
        select: "orderNumber orderStatus grandTotal items paymentStatus",
    },
    {
        path: "items.product",
        select: "name slug sku productType status",
    },
    {
        path: "items.variant",
        select: "title slug sku attributes",
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

export const CREDIT_LIMIT_POPULATE = [
    {
        path: "company",
    },
    {
        path: "user",
        select: "firstName lastName email phone displayName",
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
