import BaseRepository from "../../../shared/database/BaseRepository.js";
import Company from "./company.model.js";

class CompanyRepository extends BaseRepository {

    constructor() {
        super(Company);
    }

    // Find company by tax/registration number
    async findByTaxNumber(taxNumber) {
        return await this.findOne({
            taxNumber: taxNumber.trim(),
            deletedAt: null,
        });
    }

    // Find active companies
    async findActive() {
        return await this.findAll({
            status: "ACTIVE",
            deletedAt: null,
        }, null, { sort: { name: 1 } });
    }

}

export default new CompanyRepository();
