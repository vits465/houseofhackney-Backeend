import cartService from "./cart.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class CartController {

    async getCart(req, res, next) {

        try {

            const cart = await cartService.getCart(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Cart fetched successfully.",
                cart
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async add(req, res, next) {

        try {

            const { product, variant, quantity } = req.body;

            const cart = await cartService.addToCart(req.user._id, {
                product,
                variant: variant || null,
                quantity: quantity ? Number(quantity) : 1,
            });

            return new ApiResponse(
                res,
                200,
                "Item added to cart successfully.",
                cart
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async updateQuantity(req, res, next) {

        try {

            const { itemId } = req.params;
            const { quantity } = req.body;

            const cart = await cartService.updateQuantity(
                req.user._id,
                itemId,
                Number(quantity)
            );

            return new ApiResponse(
                res,
                200,
                "Cart item quantity updated successfully.",
                cart
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async remove(req, res, next) {

        try {

            const { itemId } = req.params;

            const cart = await cartService.removeItem(
                req.user._id,
                itemId
            );

            return new ApiResponse(
                res,
                200,
                "Cart item removed successfully.",
                cart
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async clear(req, res, next) {

        try {

            const cart = await cartService.clearCart(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Cart cleared successfully.",
                cart
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async applyCoupon(req, res, next) {

        try {

            const { couponCode } = req.body;

            const cart = await cartService.applyCoupon(
                req.user._id,
                couponCode
            );

            return new ApiResponse(
                res,
                200,
                "Coupon applied successfully.",
                cart
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async removeCoupon(req, res, next) {

        try {

            const cart = await cartService.removeCoupon(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Coupon removed successfully.",
                cart
            ).send();

        } catch (error) {
            next(error);
        }

    }

}

export default new CartController();
