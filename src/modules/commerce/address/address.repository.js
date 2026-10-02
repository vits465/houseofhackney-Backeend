import BaseRepository from "../../../shared/database/BaseRepository.js";
import Address from "./address.model.js";
import { ADDRESS_POPULATE } from "../../../shared/populate/commerce.populate.js";

class AddressRepository extends BaseRepository {

    constructor() {
        super(Address, ADDRESS_POPULATE);
    }

    // Find all addresses for a specific user
    async findByUser(userId) {
        return await this.findAll({
            user: userId,
            deletedAt: null,
        }, null, { sort: { isDefault: -1, createdAt: -1 } });
    }

    // Find default address for a specific user
    async findDefault(userId) {
        return await this.findOne({
            user: userId,
            isDefault: true,
            deletedAt: null,
        });
    }

    // Unset default flag for all addresses of a user
    async removeDefault(userId) {
        return await this.model.updateMany(
            { user: userId, deletedAt: null },
            { $set: { isDefault: false } }
        );
    }

    // Set a specific address as default for a user
    async setDefault(userId, addressId) {
        await this.removeDefault(userId);

        return await this.model.findOneAndUpdate(
            { _id: addressId, user: userId, deletedAt: null },
            { $set: { isDefault: true } },
            { new: true }
        ).populate(ADDRESS_POPULATE);
    }

}

export default new AddressRepository();
