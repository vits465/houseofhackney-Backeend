import BaseService from "../../../shared/database/BaseService.js";
import quotationRepository from "./quotation.repository.js";
import tradeProfileRepository from "../tradeProfile/tradeProfile.repository.js";
import productRepository from "../../product/product/product.repository.js";
import orderRepository from "../../commerce/Order/order.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class QuotationService extends BaseService {

    constructor() {
        super(quotationRepository);
    }

    // Generate unique quote number
    generateQuoteNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `QUO-${timestamp}-${random}`;
    }

    // Request a quote (Trade Customer)
    async requestQuote(userId, { items = [], customerNotes = "" }) {
        const tradeProfile = await tradeProfileRepository.findByUser(userId);

        if (!tradeProfile || tradeProfile.status !== "APPROVED") {
            throw new AppError("Only approved trade accounts can request quotations.", 403);
        }

        if (items.length === 0) {
            throw new AppError("Quotation items cannot be empty.", 400);
        }

        let subtotal = 0;
        const quotationItems = [];

        for (const item of items) {
            const product = await productRepository.findById(item.product);

            if (!product) {
                throw new AppError(`Product with ID ${item.product} not found.`, 404);
            }

            const unitPrice = item.unitPrice || product.price || 100;
            const quantity = Number(item.quantity) || 1;
            const total = unitPrice * quantity;

            subtotal += total;

            quotationItems.push({
                product: product._id,
                variant: item.variant || null,
                name: product.name,
                unitPrice,
                quantity,
                total,
            });
        }

        const quoteNumber = this.generateQuoteNumber();
        const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days validity

        const quoteData = {
            quoteNumber,
            user: userId,
            company: tradeProfile.company._id || tradeProfile.company,
            items: quotationItems,
            subtotal,
            grandTotal: subtotal,
            status: "REQUESTED",
            customerNotes,
            expiresAt,
            createdBy: userId,
        };

        return await this.repository.create(quoteData);
    }

    // Get user quotation history
    async getUserQuotes(userId) {
        return await this.repository.findByUser(userId);
    }

    // Get quote details by ID
    async getQuoteById(userId, quoteId, isAdmin = false) {
        const query = isAdmin ? { _id: quoteId, deletedAt: null } : { _id: quoteId, user: userId, deletedAt: null };

        const quote = await this.repository.findOne(query);

        if (!quote) {
            throw new AppError("Quotation not found.", 404);
        }

        return quote;
    }

    // Negotiate quote: Update prices & terms (Admin)
    async negotiateQuote(adminId, quoteId, { negotiatedItems = [], discount = 0, adminNotes = "" }) {
        const quote = await this.repository.findOne({ _id: quoteId, deletedAt: null });

        if (!quote) {
            throw new AppError("Quotation not found.", 404);
        }

        let negotiatedSubtotal = quote.subtotal;

        if (negotiatedItems.length > 0) {
            negotiatedSubtotal = 0;
            for (const nItem of negotiatedItems) {
                const item = quote.items.id(nItem.itemId);
                if (item) {
                    item.negotiatedPrice = Number(nItem.negotiatedPrice);
                    item.total = item.negotiatedPrice * item.quantity;
                    negotiatedSubtotal += item.total;
                }
            }
        }

        const grandTotal = Math.max(0, negotiatedSubtotal - Number(discount));

        return await this.repository.updateStatus(quote._id, "NEGOTIATING", {
            negotiatedSubtotal,
            discount: Number(discount),
            grandTotal,
            adminNotes,
            updatedBy: adminId,
        });
    }

    // Approve quotation (Admin or Customer)
    async approveQuote(userId, quoteId) {
        const quote = await this.repository.findOne({ _id: quoteId, deletedAt: null });

        if (!quote) {
            throw new AppError("Quotation not found.", 404);
        }

        return await this.repository.updateStatus(quote._id, "APPROVED", {
            updatedBy: userId,
        });
    }

    // Convert quotation into Trade Order
    async convertToOrder(userId, quoteId, shippingAddress) {
        const quote = await this.repository.findOne({ _id: quoteId, user: userId, deletedAt: null });

        if (!quote) {
            throw new AppError("Quotation not found.", 404);
        }

        if (quote.status !== "APPROVED") {
            throw new AppError("Only approved quotations can be converted to an order.", 400);
        }

        const orderItems = quote.items.map((item) => ({
            product: item.product,
            variant: item.variant,
            name: item.name,
            sku: "TRADE-SKU",
            unitPrice: item.negotiatedPrice !== null ? item.negotiatedPrice : item.unitPrice,
            quantity: item.quantity,
            discount: 0,
            tax: 0,
            total: item.total,
        }));

        const timestamp = Date.now().toString().slice(-6);
        const orderNumber = `TRD-ORD-${timestamp}`;

        const tradeOrderData = {
            orderNumber,
            user: userId,
            items: orderItems,
            shippingAddress,
            billingAddress: shippingAddress,
            subtotal: quote.negotiatedSubtotal || quote.subtotal,
            discount: quote.discount,
            tax: 0,
            shippingFee: 0,
            grandTotal: quote.grandTotal,
            currency: "INR",
            paymentMethod: "COD",
            orderStatus: "CONFIRMED",
            notes: `Converted from Quotation #${quote.quoteNumber}`,
            createdBy: userId,
        };

        const order = await orderRepository.create(tradeOrderData);

        await this.repository.updateStatus(quote._id, "CONVERTED", {
            convertedOrder: order._id,
            updatedBy: userId,
        });

        return order;
    }

}

export default new QuotationService();
