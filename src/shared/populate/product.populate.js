export const PRODUCT_POPULATE = [
    {
        path: "category",
        select: "name slug description image banner parentCategory sortOrder isFeatured showInMenu status",
        populate: {
            path: "parentCategory",
            select: "name slug description",
        },
    },
    {
        path: "brand",
        select: "name slug description shortDescription logo banner image website country establishedYear sortOrder isFeatured status",
    },
    {
        path: "collection",
        select: "name slug description image status",
    },
    {
        path: "designer",
        select: "name slug bio avatar status",
    },
    {
        path: "material",
        select: "name slug description status",
    },
    {
        path: "colours",
        select: "name slug colorHex code status",
    },
    {
        path: "patterns",
        select: "name slug description status",
    },
    {
        path: "themes",
        select: "name slug description status",
    },
    {
        path: "styles",
        select: "name slug description status",
    },
    {
        path: "rooms",
        select: "name slug description status",
    },
    {
        path: "publishedBy",
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

export default PRODUCT_POPULATE;