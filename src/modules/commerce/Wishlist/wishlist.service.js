import BaseService from "../../../shared/database/BaseService.js";
import wishlistRepository from "./wishlist.repository.js";
import productRepository from "../../product/product/product.repository.js";
import variantRepository from "../../product/Variant/variant.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class WishlistService extends BaseService {

    constructor() {
        super(wishlistRepository);
    }

    async getWishlist(userId) {

        let wishlist = await this.repository.findByUser(userId);

        if (!wishlist) {
            wishlist = await this.repository.create({
                user: userId,
                items: [],
                createdBy: userId,
            });
        }

        return wishlist;

    }

    async addToWishlist(userId, { product: productId, variant: variantId = null }) {

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

        let wishlist = await this.repository.findByUser(userId);

        if (!wishlist) {
            wishlist = await this.repository.create({
                user: userId,
                items: [],
                createdBy: userId,
            });
        }

        const isDuplicate = wishlist.items.some((item) => {
            const itemProdId = item.product?._id?.toString() || item.product?.toString();
            const itemVarId = item.variant?._id?.toString() || item.variant?.toString() || null;

            const prodMatches = itemProdId === productId.toString();
            const varMatches = variantId ? itemVarId === variantId.toString() : itemVarId === null;

            return prodMatches && varMatches;
        });

        if (isDuplicate) {
            throw new AppError("This product variant is already in your wishlist.", 409);
        }

        const newItem = {
            product: productId,
            variant: variantId || null,
            addedAt: new Date(),
        };

        return await this.repository.addItem(userId, newItem);

    }

    async removeFromWishlist(userId, productId, variantId = null) {

        const wishlist = await this.repository.findByUser(userId);

        if (!wishlist) {
            throw new AppError("Wishlist not found.", 404);
        }

        return await this.repository.removeItem(userId, productId, variantId);

    }

    async clearWishlist(userId) {

        const wishlist = await this.repository.findByUser(userId);

        if (!wishlist) {
            throw new AppError("Wishlist not found.", 404);
        }

        return await this.repository.clearWishlist(userId);

    }

}

export default new WishlistService();
