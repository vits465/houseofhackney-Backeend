import BaseRepository from "../../shared/database/BaseRepository.js";
import Media from "./media.model.js";

class MediaRepository extends BaseRepository {

    constructor() {
        super(Media);
    }

    async findByPublicId(publicId) {

        return await this.findOne({
            publicId,
        });

    }

}

export default new MediaRepository();