export const ROLE_POPULATE = [
    {
        path: "permissions.permission",
        select: "name displayName slug action moduleId description status isSystem",
        populate: {
            path: "moduleId",
            select: "name slug displayName description icon status",
        },
    },
];

export const PERMISSION_POPULATE = [
    {
        path: "moduleId",
        select: "name slug displayName description icon status",
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

export const SESSION_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email displayName accountType isTradeAccount status",
    },
];

export const USER_TOKEN_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email displayName accountType isTradeAccount status",
    },
];
