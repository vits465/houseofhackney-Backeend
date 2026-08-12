import couponService from "./coupon.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class CouponController {

    // Create a new coupon (Admin)
    async create(req, res, next) {
        try {
            const coupon = await couponService.createCoupon(req.body, req.user._id);

            return new ApiResponse(
                res,
                201,
                "Coupon created successfully.",
                coupon
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get all coupons
    async getAll(req, res, next) {
        try {
            const coupons = await couponService.getCoupons(req.query);

            return new ApiResponse(
                res,
                200,
                "Coupons fetched successfully.",
                coupons
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get single coupon by ID
    async getById(req, res, next) {
        try {
            const coupon = await couponService.getCouponById(req.params.id);

            return new ApiResponse(
                res,
                200,
                "Coupon fetched successfully.",
                coupon
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Validate coupon code
    async validate(req, res, next) {
        try {
            const { code, subtotal } = req.body;

            const result = await couponService.validateAndApply(
                code,
                req.user,
                Number(subtotal) || 0
            );

            return new ApiResponse(
                res,
                200,
                "Coupon is valid.",
                result
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Update coupon details (Admin)
    async update(req, res, next) {
        try {
            const coupon = await couponService.updateCoupon(
                req.params.id,
                req.body,
                req.user._id
            );

            return new ApiResponse(
                res,
                200,
                "Coupon updated successfully.",
                coupon
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Delete coupon (Admin)
    async delete(req, res, next) {
        try {
            await couponService.deleteCoupon(req.params.id);

            return new ApiResponse(
                res,
                200,
                "Coupon deleted successfully."
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new CouponController();
