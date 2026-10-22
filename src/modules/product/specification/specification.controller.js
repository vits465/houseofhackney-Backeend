import specificationService from "./specification.service.js";
import productService from "../product/product.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";
import AppError from "../../../shared/errors/AppError.js";

class SpecificationController {

    async get(req, res, next) {
        try {
            const { productId } = req.params;

            const product = (await productService.findById(productId)) || (await productService.getBySlug(productId));
            if (!product || product.deletedAt) {
                throw new AppError("Product not found.", 404);
            }

            // Return technical specifications if configured, else empty object (do not invent values)
            let specifications = {};

            if (product.specifications && typeof product.specifications === "object") {
                const s = typeof product.specifications.toObject === "function" ? product.specifications.toObject() : product.specifications;
                // Only return non-empty fields
                const hasData =
                    s.composition ||
                    s.width?.value ||
                    s.verticalRepeat?.value ||
                    s.horizontalRepeat?.value ||
                    s.careInstructions?.length ||
                    s.countryOfOrigin ||
                    s.suitability?.length ||
                    s.certifications?.length;

                if (hasData) {
                    specifications = s;
                }
            }

            if (Object.keys(specifications).length === 0) {
                // Check legacy ProductSpecification collection
                const legacySpec = await specificationService.getByProduct(product._id);
                if (legacySpec && legacySpec.specifications?.length) {
                    specifications = {
                        items: legacySpec.specifications,
                    };
                }
            }

            return new ApiResponse(
                res,
                200,
                "Product specifications fetched successfully.",
                specifications
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const productId = req.body.product || req.params.productId;

            const specification = await specificationService.createSpecification({
                ...req.body,
                product: productId,
                createdBy: req.user?._id,
            });

            return new ApiResponse(
                res,
                201,
                "Product specification created successfully.",
                specification
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const specification = await specificationService.updateSpecification(
                req.params.productId,
                {
                    ...req.body,
                    updatedBy: req.user?._id,
                }
            );

            return new ApiResponse(
                res,
                200,
                "Product specification updated successfully.",
                specification
            ).send();
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await specificationService.deleteSpecification(
                req.params.productId,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Product specification deleted successfully."
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new SpecificationController();
