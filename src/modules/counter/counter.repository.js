import BaseRepository from "../../shared/database/BaseRepository.js";
import Counter from "./counter.model.js";

class CounterRepository extends BaseRepository {

    constructor() {
        super(Counter);
    }

    async getNextSequence(name, prefix) {

        return await this.model.findOneAndUpdate(
            { name },
            {
                $inc: {
                    sequence: 1,
                },
                $setOnInsert: {
                    prefix,
                },
            },
            {
                new: true,
                upsert: true,
            }
        );

    }

}

export default new CounterRepository();