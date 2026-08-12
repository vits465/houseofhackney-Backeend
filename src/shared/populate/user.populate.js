export const USER_POPULATE = [
    {
        path: "roles",
        select: "name slug permissions",
        populate: {
            path: "permissions.permission",
            select: "name slug module",
        },
    },
    {
        path: "tradeProfile",
        populate: {
            path: "company",
        },
    },
];