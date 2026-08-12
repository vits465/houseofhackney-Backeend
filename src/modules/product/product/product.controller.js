import productService from "./product.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class ProductController {

    async create(req, res, next) {
        try {
            const product = await productService.createProduct({
                ...req.body,
                createdBy: req.user?._id,
            });

            return new ApiResponse(res, 201, "Product created successfully.", product).send();
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const products = await productService.findAll();
            return new ApiResponse(res, 200, "Products fetched successfully.", products).send();
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const product = await productService.findById(req.params.id);
            return new ApiResponse(res, 200, "Product fetched successfully.", product).send();
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const product = await productService.updateProduct(req.params.id, {
                ...req.body,
                updatedBy: req.user?._id,
            });

            return new ApiResponse(res, 200, "Product updated successfully.", product).send();
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await productService.deleteProduct(req.params.id, req.user?._id);
            return new ApiResponse(res, 200, "Product deleted successfully.").send();
        } catch (error) {
            next(error);
        }
    }

}

export default new ProductController();