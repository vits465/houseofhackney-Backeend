import wishlistService from "./wishlist.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class WishlistController {

    async getWishlist(req, res, next) {

        try {

            const wishlist = await wishlistService.getWishlist(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Wishlist fetched successfully.",
                wishlist
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async add(req, res, next) {

        try {

            const { product, variant } = req.body;

            const wishlist = await wishlistService.addToWishlist(req.user._id, {
                product,
                variant: variant || null,
            });

            return new ApiResponse(
                res,
                200,
                "Item added to wishlist successfully.",
                wishlist
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async remove(req, res, next) {

        try {

            const { productId } = req.params;
            const { variantId } = req.query;

            const wishlist = await wishlistService.removeFromWishlist(
                req.user._id,
                productId,
                variantId || null
            );

            return new ApiResponse(
                res,
                200,
                "Item removed from wishlist successfully.",
                wishlist
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async clear(req, res, next) {

        try {

            const wishlist = await wishlistService.clearWishlist(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Wishlist cleared successfully.",
                wishlist
            ).send();

        } catch (error) {
            next(error);
        }

    }

}

export default new WishlistController();
