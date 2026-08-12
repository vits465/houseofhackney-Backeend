import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductRelated from "./related.model.js";

class RelatedRepository extends BaseRepository {

    constructor() {
        super(ProductRelated);
    }

    async findByProduct(productId) {

        return await this.model.findOne({
            product: productId,
            deletedAt: null,
        }).populate("relatedProducts.product");

    }

    async addRelatedProduct(productId, item) {

        return await this.model.findOneAndUpdate(
            {
                product: productId,
                deletedAt: null,
            },
            {
                $push: { relatedProducts: item },
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate("relatedProducts.product");

    }

    async removeRelatedProduct(productId, targetProductId) {

        return await this.model.findOneAndUpdate(
            {
                product: productId,
                deletedAt: null,
            },
            {
                $pull: {
                    relatedProducts: { product: targetProductId },
                },
            },
            {
                new: true,
            }
        ).populate("relatedProducts.product");

    }

}

export default new RelatedRepository();
