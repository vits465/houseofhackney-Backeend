import BaseRepository from "../../../shared/database/BaseRepository.js";
import ProductRelated from "./related.model.js";
import { RELATED_POPULATE } from "../../../shared/populate/product_sub.populate.js";

class RelatedRepository extends BaseRepository {

    constructor() {
        super(ProductRelated, RELATED_POPULATE);
    }

    async findByProduct(productId) {

        return await this.findOne({
            product: productId,
            deletedAt: null,
        });

    }

    async addRelatedProduct(productId, item) {

        const doc = await this.model.findOneAndUpdate(
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
        );

        if (doc && doc._id) {
            return await this.findById(doc._id);
        }

        return doc;

    }

    async removeRelatedProduct(productId, targetProductId) {

        const doc = await this.model.findOneAndUpdate(
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
        );

        if (doc && doc._id) {
            return await this.findById(doc._id);
        }

        return doc;

    }

}

export default new RelatedRepository();
