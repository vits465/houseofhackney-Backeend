import BaseRepository from "../../../shared/database/BaseRepository.js";
import Quotation from "./quotation.model.js";

class QuotationRepository extends BaseRepository {

    constructor() {
        super(Quotation);
    }

    // Find all quotes for a user
    async findByUser(userId) {
        return await this.model.find({
            user: userId,
            deletedAt: null,
        })
            .populate("company")
            .sort({ createdAt: -1 });
    }

    // Find quote by quote number
    async findByQuoteNumber(quoteNumber) {
        return await this.model.findOne({
            quoteNumber: quoteNumber.trim().toUpperCase(),
            deletedAt: null,
        })
            .populate("user", "fullName email")
            .populate("company");
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
        );
    }

}

export default new QuotationRepository();
