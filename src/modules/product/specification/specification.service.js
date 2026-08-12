import BaseService from "../../../shared/database/BaseService.js";
import specificationRepository from "./specification.repository.js";
import productRepository from "../product/product.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class SpecificationService extends BaseService {

    constructor() {
        super(specificationRepository);
    }

    async getByProduct(productId) {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        return await this.repository.findByProduct(productId);

    }

    async createSpecification(data) {

        const product = await productRepository.findById(data.product);

        if (!product) {
            throw new AppError("Product not found.", 404);
        }

        const existing = await this.repository.findByProduct(data.product);

        if (existing) {
            throw new AppError("Specification already exists for this product.", 409);
        }

        return await this.repository.create(data);

    }

    async updateSpecification(productId, updateData) {

        const specification = await this.repository.findByProduct(productId);

        if (!specification) {
            throw new AppError("Specification not found for this product.", 404);
        }

        return await this.repository.update(specification._id, updateData);

    }

    async deleteSpecification(productId, deletedBy) {

        const specification = await this.repository.findByProduct(productId);

        if (!specification) {
            throw new AppError("Specification not found for this product.", 404);
        }

        return await this.repository.softDelete(specification._id, {
            updatedBy: deletedBy,
        });

    }

}

export default new SpecificationService();
