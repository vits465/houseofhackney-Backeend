import BaseService from "../../shared/database/BaseService.js";
import mediaRepository from "./media.repository.js";

class MediaService extends BaseService {

    constructor() {
        super(mediaRepository);
    }

}

export default new MediaService();