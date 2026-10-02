export const PRICING_POPULATE = [
    {
        path: "product",
        select: "name slug sku productType status shortDescription",
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

export const PRODUCT_MEDIA_POPULATE = [
    {
        path: "product",
        select: "name slug sku productType status",
    },
    {
        path: "thumbnail",
    },
    {
        path: "gallery",
    },
    {
        path: "videos",
    },
    {
        path: "documents",
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

export const VARIANT_POPULATE = [
    {
        path: "product",
        select: "name slug sku productType status shortDescription",
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

export const INVENTORY_POPULATE = [
    {
        path: "product",
        select: "name slug sku productType status shortDescription",
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

export const SPECIFICATION_POPULATE = [
    {
        path: "product",
        select: "name slug sku productType status",
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

export const SEO_POPULATE = [
    {
        path: "product",
        select: "name slug sku productType status",
    },
    {
        path: "ogImage",
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

export const RELATED_POPULATE = [
    {
        path: "product",
        select: "name slug sku productType status shortDescription",
    },
    {
        path: "relatedProducts.product",
        select: "name slug sku productType status shortDescription isFeatured isBestSeller",
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

export const REVIEW_POPULATE = [
    {
        path: "product",
        select: "name slug sku productType status",
    },
    {
        path: "user",
        select: "firstName lastName email avatar displayName",
    },
    {
        path: "variant",
        select: "title slug sku attributes",
    },
    {
        path: "order",
        select: "orderNumber orderStatus",
    },
    {
        path: "images",
    },
    {
        path: "reply.repliedBy",
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

export const ATTRIBUTE_POPULATE = [
    {
        path: "values.image",
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
