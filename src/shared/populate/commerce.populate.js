export const PAYMENT_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email phone displayName",
    },
    {
        path: "order",
        select: "orderNumber orderStatus grandTotal paymentStatus items shippingAddress subtotal discount tax shippingFee currency",
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

export const SHIPMENT_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email phone displayName",
    },
    {
        path: "order",
        select: "orderNumber orderStatus grandTotal items shippingAddress subtotal",
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

export const INVOICE_POPULATE = [
    {
        path: "user",
        select: "firstName lastName email phone displayName",
    },
    {
        path: "order",
        select: "orderNumber orderStatus grandTotal items subtotal discount tax shippingFee currency paymentStatus",
    },
    {
        path: "shipment",
        select: "shipmentNumber status courierName trackingNumber trackingUrl shippedAt estimatedDelivery deliveredAt",
    },
    {
        path: "payment",
        select: "transactionId status paymentMethod amount currency paidAt provider",
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

export const ADDRESS_POPULATE = [
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

export const COUPON_POPULATE = [
    {
        path: "applicableCategories",
        select: "name slug description",
    },
    {
        path: "applicableProducts",
        select: "name slug sku productType status",
    },
    {
        path: "applicableBrands",
        select: "name slug description logo",
    },
    {
        path: "applicableUsers",
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
