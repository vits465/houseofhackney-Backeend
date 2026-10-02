import BaseRepository from "../../../shared/database/BaseRepository.js";
import Cart from "./cart.model.js";
import { CART_POPULATE } from "../../../shared/populate/cart.populate.js";

class CartRepository extends BaseRepository {

    constructor() {
        super(Cart, CART_POPULATE);
    }

    async findByUser(userId) {

        return await this.model.findOne({
            user: userId,
            deletedAt: null,
        }).populate(CART_POPULATE);

    }

    async saveCart(cartDoc) {

        await cartDoc.save();

        return await this.findByUser(cartDoc.user);

    }

    async clearCart(userId) {

        return await this.model.findOneAndUpdate(
            {
                user: userId,
                deletedAt: null,
            },
            {
                $set: {
                    items: [],
                    subtotal: 0,
                    discount: 0,
                    tax: 0,
                    shipping: 0,
                    grandTotal: 0,
                    coupon: null,
                },
            },
            { new: true }
        ).populate(CART_POPULATE);

    }

}

export default new CartRepository();
