import BaseRepository from "../../../shared/database/BaseRepository.js";
import CreditLimit from "./creditLimit.model.js";
import { CREDIT_LIMIT_POPULATE } from "../../../shared/populate/trade.populate.js";

class CreditLimitRepository extends BaseRepository {

    constructor() {
        super(CreditLimit, CREDIT_LIMIT_POPULATE);
    }

    // Find credit limit by company ID
    async findByCompany(companyId) {
        return await this.findOne({
            company: companyId,
            deletedAt: null,
        });
    }

    // Find credit limit by user ID
    async findByUser(userId) {
        return await this.findOne({
            user: userId,
            deletedAt: null,
        });
    }

}

export default new CreditLimitRepository();
