export const USER_POPULATE = [
    {
        path: "roles",
        select: "name displayName slug permissions priority level isDefault canLoginAdmin canLoginWebsite status",
        populate: {
            path: "permissions.permission",
            select: "name displayName slug action moduleId",
            populate: {
                path: "moduleId",
                select: "name slug displayName description",
            },
        },
    },
    {
        path: "tradeProfile",
        populate: [
            {
                path: "company",
            },
            {
                path: "tier",
                select: "name discountPercentage creditLimit minOrderAmount maxCreditPeriod",
            },
        ],
    },
];

export default USER_POPULATE;