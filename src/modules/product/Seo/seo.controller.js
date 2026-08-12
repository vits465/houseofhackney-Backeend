import seoService from "./seo.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class SeoController {

    async create(req, res, next) {

        try {

            const productId = req.body.product || req.params.productId;

            const seo = await seoService.createSEO({
                ...req.body,
                product: productId,
                createdBy: req.user?._id,
            });

            return new ApiResponse(
                res,
                201,
                "SEO created successfully.",
                seo
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async get(req, res, next) {

        try {

            const seo = await seoService.getSEO(
                req.params.productId
            );

            return new ApiResponse(
                res,
                200,
                "SEO fetched successfully.",
                seo
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async update(req, res, next) {

        try {

            const seo = await seoService.updateSEO(
                req.params.productId,
                {
                    ...req.body,
                    updatedBy: req.user?._id,
                }
            );

            return new ApiResponse(
                res,
                200,
                "SEO updated successfully.",
                seo
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async delete(req, res, next) {

        try {

            await seoService.deleteSEO(
                req.params.productId,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "SEO deleted successfully."
            ).send();

        } catch (error) {
            next(error);
        }

    }

}

export default new SeoController();