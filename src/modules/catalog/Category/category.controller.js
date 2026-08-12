import categoryService from "./category.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class CategoryController {

    async create(req, res, next) {

        try {

            const category = await categoryService.createCategory({
                ...req.body,
                createdBy: req.user?._id,
            });

            return new ApiResponse(
                res,
                201,
                "Category created successfully.",
                category
            ).send();

        } catch (error) {

            next(error);

        }

    }

    async getAll(req, res, next) {

        try {

            const categories =
                await categoryService.findAll();

            return new ApiResponse(
                res,
                200,
                "Categories fetched successfully.",
                categories
            ).send();

        } catch (error) {

            next(error);

        }

    }

    async getById(req, res, next) {

        try {

            const category =
                await categoryService.findById(req.params.id);

            return new ApiResponse(
                res,
                200,
                "Category fetched successfully.",
                category
            ).send();

        } catch (error) {

            next(error);

        }

    }

    async update(req, res, next) {

        try {

            const category =
                await categoryService.updateCategory(
                    req.params.id,
                    {
                        ...req.body,
                        updatedBy: req.user?._id,
                    }
                );

            return new ApiResponse(
                res,
                200,
                "Category updated successfully.",
                category
            ).send();

        } catch (error) {

            next(error);

        }

    }

    async delete(req, res, next) {

        try {

            await categoryService.deleteCategory(
                req.params.id,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Category deleted successfully."
            ).send();

        } catch (error) {

            next(error);

        }

    }

}

export default new CategoryController();