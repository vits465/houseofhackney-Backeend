import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductSpecification from "./specification.model.js";
import { SPECIFICATION_POPULATE } from "../../../shared/populate/product_sub.populate.js";

class SpecificationRepository extends BaseRepository {

    constructor() {
        super(ProductSpecification, SPECIFICATION_POPULATE);
    }

    async findByProduct(productId) {

        return await this.findOne({
            product: productId,
            deletedAt: null,
        });

    }

}

export default new SpecificationRepository();
