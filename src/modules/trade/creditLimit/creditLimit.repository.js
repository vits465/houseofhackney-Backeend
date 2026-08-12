import BaseRepository from "../../../shared/database/BaseRepository.js";
import CreditLimit from "./creditLimit.model.js";

class CreditLimitRepository extends BaseRepository {

    constructor() {
        super(CreditLimit);
    }

    // Find credit limit by company ID
    async findByCompany(companyId) {
        return await this.model.findOne({
            company: companyId,
            deletedAt: null,
        }).populate("company", "name taxNumber");
    }

    // Find credit limit by user ID
    async findByUser(userId) {
        return await this.model.findOne({
            user: userId,
            deletedAt: null,
        }).populate("company", "name taxNumber");
    }

}

export default new CreditLimitRepository();
