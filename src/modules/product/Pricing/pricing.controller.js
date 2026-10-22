import pricingService from "./pricing.service.js";
import productService from "../product/product.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";
import AppError from "../../../shared/errors/AppError.js";
import { formatPricing } from "../product/product.formatter.js";

class PricingController {

    async create(req, res, next) {
        try {
            const pricing = await pricingService.createPricing({
                ...req.body,
                createdBy: req.user?._id,
            });

            return new ApiResponse(res, 201, "Pricing created successfully.", formatPricing(pricing, req.user)).send();
        } catch (error) {
            next(error);
        }
    }

    async get(req, res, next) {
        try {
            const { productId } = req.params;

            const product = (await productService.findById(productId)) || (await productService.getBySlug(productId));
            if (!product || product.deletedAt) {
                throw new AppError("Product not found.", 404);
            }

            let pricing = await pricingService.getPricing(product._id);

            if (!pricing) {
                // Return default pricing structure for product if unconfigured
                const defaultUnit =
                    product.productType === "FABRIC"
                        ? "metre"
                        : product.productType === "WALLPAPER"
                        ? "roll"
                        : product.productType === "PAINT"
                        ? "tin"
                        : "item";

                pricing = {
                    currency: "GBP",
                    basePrice: 145,
                    sellingPrice: 145,
                    compareAtPrice: 165,
                    tradePrice: 105,
                    priceUnit: defaultUnit,
                    sample: {
                        available: product.productType === "FABRIC" || product.productType === "WALLPAPER" || product.productType === "PAINT",
                        price: product.productType === "PAINT" ? 5 : 4,
                        currency: "GBP",
                    },
                };
            }

            const formatted = formatPricing(pricing, req.user);

            return new ApiResponse(res, 200, "Pricing fetched successfully.", formatted).send();
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const pricing = await pricingService.updatePricing(
                req.params.productId,
                {
                    ...req.body,
                    updatedBy: req.user?._id,
                }
            );

            return new ApiResponse(res, 200, "Pricing updated successfully.", formatPricing(pricing, req.user)).send();
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await pricingService.deletePricing(
                req.params.productId,
                req.user?._id
            );

            return new ApiResponse(res, 200, "Pricing deleted successfully.").send();
        } catch (error) {
            next(error);
        }
    }

}

export default new PricingController();