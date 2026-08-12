import BaseRepository from "../../../shared/database/BaseRepository.js";
import Address from "./address.model.js";

class AddressRepository extends BaseRepository {

    constructor() {
        super(Address);
    }

    // Find all addresses for a specific user
    async findByUser(userId) {
        return await this.model.find({
            user: userId,
            deletedAt: null,
        }).sort({ isDefault: -1, createdAt: -1 });
    }

    // Find default address for a specific user
    async findDefault(userId) {
        return await this.model.findOne({
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
        );
    }

}

export default new AddressRepository();
