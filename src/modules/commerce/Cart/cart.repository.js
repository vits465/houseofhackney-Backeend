import BaseRepository from "../../../shared/database/BaseRepository.js";
import Cart from "./cart.model.js";

class CartRepository extends BaseRepository {

    constructor() {
        super(Cart);
    }

    async findByUser(userId) {

        return await this.model.findOne({
            user: userId,
            deletedAt: null,
        })
            .populate("items.product", "name slug sku thumbnail productType")
            .populate("items.variant", "name sku attributes");

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
        );

    }

}

export default new CartRepository();
