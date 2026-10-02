import BaseRepository from "../../../shared/database/BaseRepository.js";
import Collection from "./collection.model.js";
import { COLLECTION_POPULATE } from "../../../shared/populate/catalog.populate.js";

class CollectionRepository extends BaseRepository {

    constructor() {
        super(Collection, COLLECTION_POPULATE);
    }

    async findBySlug(slug) {
        return await this.findOne({
            slug,
        });
    }

    async existsBySlug(slug) {
        return await this.exists({
            slug,
        });
    }

}

export default new CollectionRepository();
