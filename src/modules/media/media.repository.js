import BaseRepository from "../../shared/database/BaseRepository.js";
import Media from "./media.model.js";

const MEDIA_POPULATE = [
    {
        path: "createdBy",
        select: "firstName lastName email displayName",
    },
];

class MediaRepository extends BaseRepository {

    constructor() {
        super(Media, MEDIA_POPULATE);
    }

    async findByPublicId(publicId) {

        return await this.findOne({
            publicId,
        });

    }

}

export default new MediaRepository();