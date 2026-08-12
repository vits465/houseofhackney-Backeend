import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductSpecification from "./specification.model.js";

class SpecificationRepository extends BaseRepository {

    constructor() {
        super(ProductSpecification);
    }

    async findByProduct(productId) {

        return await this.findOne({
            product: productId,
            deletedAt: null,
        });

    }

}

export default new SpecificationRepository();
