import BaseService from "../../../shared/database/BaseService.js";
import addressRepository from "./address.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class AddressService extends BaseService {

    constructor() {
        super(addressRepository);
    }

    // Get all active addresses for a user
    async getAddresses(userId) {
        return await this.repository.findByUser(userId);
    }

    // Get single address by ID for a user
    async getAddressById(userId, addressId) {
        const address = await this.repository.findOne({
            _id: addressId,
            user: userId,
            deletedAt: null,
        });

        if (!address) {
            throw new AppError("Address not found.", 404);
        }

        return address;
    }

    // Create a new address for a user
    async createAddress(userId, addressData) {
        const userAddresses = await this.repository.findByUser(userId);

        // If user has no existing addresses, make this first address default
        if (userAddresses.length === 0) {
            addressData.isDefault = true;
        }

        // If new address is marked default, clear previous default flag
        if (addressData.isDefault) {
            await this.repository.removeDefault(userId);
        }

        addressData.user = userId;
        addressData.createdBy = userId;

        return await this.repository.create(addressData);
    }

    // Update an existing address
    async updateAddress(userId, addressId, updateData) {
        const existingAddress = await this.getAddressById(userId, addressId);

        // If updated address is set as default, clear previous default flag
        if (updateData.isDefault) {
            await this.repository.removeDefault(userId);
        }

        updateData.updatedBy = userId;

        return await this.repository.update(existingAddress._id, updateData);
    }

    // Delete an address (soft delete)
    async deleteAddress(userId, addressId) {
        const address = await this.getAddressById(userId, addressId);

        const deletedAddress = await this.repository.softDelete(address._id);

        // If deleted address was default, promote another address to default
        if (address.isDefault) {
            const remainingAddresses = await this.repository.findByUser(userId);

            if (remainingAddresses.length > 0) {
                await this.repository.setDefault(userId, remainingAddresses[0]._id);
            }
        }

        return deletedAddress;
    }

    // Set a specific address as default
    async setDefault(userId, addressId) {
        const address = await this.getAddressById(userId, addressId);

        return await this.repository.setDefault(userId, address._id);
    }

}

export default new AddressService();
