import BaseService from "../../../shared/database/BaseService.js";
import cartRepository from "./cart.repository.js";
import productRepository from "../../product/product/product.repository.js";
import variantRepository from "../../product/Variant/variant.repository.js";
import pricingRepository from "../../product/Pricing/pricing.repository.js";
import inventoryRepository from "../../product/Inventory/inventory.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class CartService extends BaseService {

    constructor() {
        super(cartRepository);
    }

    calculateTotals(cartDoc) {

        let subtotal = 0;
        let lineDiscounts = 0;
        let lineTaxes = 0;

        for (const item of cartDoc.items) {

            const lineSubtotal = item.unitPrice * item.quantity;

            subtotal += lineSubtotal;

            const itemDiscount = item.discount || 0;
            const itemTax = item.tax || 0;

            lineDiscounts += itemDiscount;
            lineTaxes += itemTax;

            item.total = Math.max(0, lineSubtotal - itemDiscount + itemTax);

        }

        let couponDiscount = 0;

        if (cartDoc.coupon) {

            if (cartDoc.coupon.discountType === "PERCENTAGE") {
                couponDiscount = (subtotal * cartDoc.coupon.discountValue) / 100;
            } else if (cartDoc.coupon.discountType === "FIXED") {
                couponDiscount = cartDoc.coupon.discountValue;
            }

        }

        const totalDiscount = Math.min(subtotal, lineDiscounts + couponDiscount);
        const tax = lineTaxes;
        const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 50;

        const grandTotal = Math.max(0, subtotal - totalDiscount + tax + shipping);

        cartDoc.subtotal = Math.round(subtotal * 100) / 100;
        cartDoc.discount = Math.round(totalDiscount * 100) / 100;
        cartDoc.tax = Math.round(tax * 100) / 100;
        cartDoc.shipping = Math.round(shipping * 100) / 100;
        cartDoc.grandTotal = Math.round(grandTotal * 100) / 100;

        return cartDoc;

    }

    async getCart(userId) {

        let cart = await this.repository.findByUser(userId);

        if (!cart) {
            cart = await this.repository.create({
                user: userId,
                items: [],
                subtotal: 0,
                discount: 0,
                tax: 0,
                shipping: 0,
                grandTotal: 0,
                createdBy: userId,
            });
        } else {
            this.calculateTotals(cart);
            cart = await this.repository.saveCart(cart);
        }

        return cart;

    }

    async addToCart(userId, { product: productId, variant: variantId = null, quantity = 1 }) {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        if (variantId) {
            const variant = await variantRepository.findById(variantId);
            if (!variant) {
                throw new AppError("Variant not found.", 404);
            }
        }

        const inventory = await inventoryRepository.findByProduct(productId);

        if (inventory && inventory.trackInventory) {
            const availableStock = inventory.availableStock || inventory.stock || 0;
            if (availableStock < quantity) {
                throw new AppError(`Insufficient stock available. Only ${availableStock} left.`, 400);
            }
        }

        const pricing = await pricingRepository.findByProduct(productId);
        const unitPrice = pricing?.sellingPrice || 100;
        const taxRate = pricing?.taxClass === "GST_18" ? 0.18 : 0;

        let cart = await this.repository.findByUser(userId);

        if (!cart) {
            cart = await this.repository.create({
                user: userId,
                items: [],
                subtotal: 0,
                discount: 0,
                tax: 0,
                shipping: 0,
                grandTotal: 0,
                createdBy: userId,
            });
        }

        const existingItemIndex = cart.items.findIndex((item) => {
            const prodMatches = (item.product?._id || item.product).toString() === productId.toString();
            const varMatches = variantId
                ? (item.variant?._id || item.variant)?.toString() === variantId.toString()
                : !item.variant;

            return prodMatches && varMatches;
        });

        if (existingItemIndex > -1) {

            const existingItem = cart.items[existingItemIndex];
            const newQty = existingItem.quantity + quantity;

            if (inventory && inventory.trackInventory) {
                const availableStock = inventory.availableStock || inventory.stock || 0;
                if (availableStock < newQty) {
                    throw new AppError(`Cannot add more. Maximum available stock is ${availableStock}.`, 400);
                }
            }

            existingItem.quantity = newQty;
            existingItem.unitPrice = unitPrice;
            existingItem.tax = Math.round(unitPrice * newQty * taxRate * 100) / 100;
            existingItem.total = (unitPrice * newQty) + existingItem.tax - (existingItem.discount || 0);

        } else {

            const lineTax = Math.round(unitPrice * quantity * taxRate * 100) / 100;
            const lineTotal = (unitPrice * quantity) + lineTax;

            cart.items.push({
                product: productId,
                variant: variantId || null,
                quantity,
                unitPrice,
                discount: 0,
                tax: lineTax,
                total: lineTotal,
                addedAt: new Date(),
            });

        }

        this.calculateTotals(cart);

        return await this.repository.saveCart(cart);

    }

    async updateQuantity(userId, itemId, quantity) {

        const cart = await this.repository.findByUser(userId);

        if (!cart) {
            throw new AppError("Cart not found.", 404);
        }

        const item = cart.items.id(itemId);

        if (!item) {
            throw new AppError("Cart item not found.", 404);
        }

        const productId = item.product?._id || item.product;
        const inventory = await inventoryRepository.findByProduct(productId);

        if (inventory && inventory.trackInventory) {
            const availableStock = inventory.availableStock || inventory.stock || 0;
            if (availableStock < quantity) {
                throw new AppError(`Cannot set quantity to ${quantity}. Only ${availableStock} left.`, 400);
            }
        }

        const pricing = await pricingRepository.findByProduct(productId);
        const taxRate = pricing?.taxClass === "GST_18" ? 0.18 : 0;

        item.quantity = quantity;
        item.tax = Math.round(item.unitPrice * quantity * taxRate * 100) / 100;
        item.total = (item.unitPrice * quantity) + item.tax - (item.discount || 0);

        this.calculateTotals(cart);

        return await this.repository.saveCart(cart);

    }

    async removeItem(userId, itemId) {

        const cart = await this.repository.findByUser(userId);

        if (!cart) {
            throw new AppError("Cart not found.", 404);
        }

        cart.items.pull(itemId);

        this.calculateTotals(cart);

        return await this.repository.saveCart(cart);

    }

    async clearCart(userId) {

        const cart = await this.repository.findByUser(userId);

        if (!cart) {
            throw new AppError("Cart not found.", 404);
        }

        return await this.repository.clearCart(userId);

    }

    async applyCoupon(userId, couponCode) {

        const cart = await this.repository.findByUser(userId);

        if (!cart) {
            throw new AppError("Cart not found.", 404);
        }

        if (cart.items.length === 0) {
            throw new AppError("Cannot apply coupon to an empty cart.", 400);
        }

        const codeUpper = couponCode.trim().toUpperCase();

        const validCoupons = {
            WELCOME10: { code: "WELCOME10", discountType: "PERCENTAGE", discountValue: 10 },
            SAVE50: { code: "SAVE50", discountType: "FIXED", discountValue: 50 },
            SUPER20: { code: "SUPER20", discountType: "PERCENTAGE", discountValue: 20 },
        };

        const coupon = validCoupons[codeUpper];

        if (!coupon) {
            throw new AppError("Invalid or expired coupon code.", 400);
        }

        cart.coupon = coupon;

        this.calculateTotals(cart);

        return await this.repository.saveCart(cart);

    }

    async removeCoupon(userId) {

        const cart = await this.repository.findByUser(userId);

        if (!cart) {
            throw new AppError("Cart not found.", 404);
        }

        cart.coupon = null;

        this.calculateTotals(cart);

        return await this.repository.saveCart(cart);

    }

}

export default new CartService();
