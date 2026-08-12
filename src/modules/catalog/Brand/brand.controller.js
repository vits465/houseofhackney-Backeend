import brandService from "./brand.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class BrandController {

    async create(req, res, next) {

        try {

            const brand = await brandService.createBrand({
                ...req.body,
                createdBy: req.user?._id,
            });

            return new ApiResponse(
                res,
                201,
                "Brand created successfully.",
                brand
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async getAll(req, res, next) {

        try {

            const brands = await brandService.findAll();

            return new ApiResponse(
                res,
                200,
                "Brands fetched successfully.",
                brands
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async getById(req, res, next) {

        try {

            const brand = await brandService.findById(req.params.id);

            return new ApiResponse(
                res,
                200,
                "Brand fetched successfully.",
                brand
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async update(req, res, next) {

        try {

            const brand = await brandService.updateBrand(
                req.params.id,
                {
                    ...req.body,
                    updatedBy: req.user?._id,
                }
            );

            return new ApiResponse(
                res,
                200,
                "Brand updated successfully.",
                brand
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async delete(req, res, next) {

        try {

            await brandService.deleteBrand(
                req.params.id,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Brand deleted successfully."
            ).send();

        } catch (error) {
            next(error);
        }

    }

}

export default new BrandController();