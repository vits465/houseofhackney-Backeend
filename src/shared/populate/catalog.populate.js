export const CATEGORY_POPULATE = [
    {
        path: "parentCategory",
        select: "name slug description image banner level path status",
    },
    {
        path: "image",
    },
    {
        path: "banner",
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

export const BRAND_POPULATE = [
    {
        path: "logo",
    },
    {
        path: "banner",
    },
    {
        path: "image",
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

export const COLLECTION_POPULATE = [
    {
        path: "image",
    },
];
