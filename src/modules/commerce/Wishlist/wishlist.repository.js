import BaseRepository from "../../../shared/database/BaseRepository.js";
import Wishlist from "./wishlist.model.js";
import { WISHLIST_POPULATE } from "../../../shared/populate/wishlist.populate.js";

class WishlistRepository extends BaseRepository {

    constructor() {
        super(Wishlist, WISHLIST_POPULATE);
    }

    async findByUser(userId) {

        return await this.model.findOne({
            user: userId,
            deletedAt: null,
        }).populate(WISHLIST_POPULATE);

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
        ).populate(WISHLIST_POPULATE);

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
        ).populate(WISHLIST_POPULATE);

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
        ).populate(WISHLIST_POPULATE);

    }

}

export default new WishlistRepository();
