import BaseRepository from "../../../shared/database/BaseRepository.js";
import Quotation from "./quotation.model.js";
import { QUOTATION_POPULATE } from "../../../shared/populate/trade.populate.js";

class QuotationRepository extends BaseRepository {

    constructor() {
        super(Quotation, QUOTATION_POPULATE);
    }

    // Find all quotes for a user
    async findByUser(userId) {
        return await this.findAll({
            user: userId,
            deletedAt: null,
        }, null, { sort: { createdAt: -1 } });
    }

    // Find quote by quote number
    async findByQuoteNumber(quoteNumber) {
        return await this.findOne({
            quoteNumber: quoteNumber.trim().toUpperCase(),
            deletedAt: null,
        });
    }

    // Update quotation status
    async updateStatus(quoteId, status, extraData = {}) {
        return await this.model.findOneAndUpdate(
            { _id: quoteId, deletedAt: null },
            {
                $set: {
                    status,
                    ...extraData,
                },
            },
            { new: true }
        ).populate(QUOTATION_POPULATE);
    }

}

export default new QuotationRepository();
