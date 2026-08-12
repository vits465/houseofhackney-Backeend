import BaseRepository from "../../../shared/database/BaseRepository.js";
import Wishlist from "./wishlist.model.js";

class WishlistRepository extends BaseRepository {

    constructor() {
        super(Wishlist);
    }

    async findByUser(userId) {

        return await this.model.findOne({
            user: userId,
            deletedAt: null,
        })
            .populate("items.product", "name slug price thumbnail status")
            .populate("items.variant", "name sku attributes");

    }

    async addItem(userId, item) {

        return await this.model.findOneAndUpdate(
            {
                user: userId,
                deletedAt: null,
            },
            {
                $push: { items: item },
            },
            {
                new: true,
                runValidators: true,
                upsert: true,
            }
        )
            .populate("items.product", "name slug price thumbnail status")
            .populate("items.variant", "name sku attributes");

    }

    async removeItem(userId, productId, variantId = null) {

        const pullQuery = variantId
            ? { product: productId, variant: variantId }
            : { product: productId };

        return await this.model.findOneAndUpdate(
            {
                user: userId,
                deletedAt: null,
            },
            {
                $pull: { items: pullQuery },
            },
            {
                new: true,
            }
        )
            .populate("items.product", "name slug price thumbnail status")
            .populate("items.variant", "name sku attributes");

    }

    async clearWishlist(userId) {

        return await this.model.findOneAndUpdate(
            {
                user: userId,
                deletedAt: null,
            },
            {
                $set: { items: [] },
            },
            {
                new: true,
            }
        );

    }

}

export default new WishlistRepository();
