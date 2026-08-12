import addressService from "./address.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class AddressController {

    // Create a new address
    async create(req, res, next) {
        try {
            const address = await addressService.createAddress(req.user._id, req.body);

            return new ApiResponse(
                res,
                201,
                "Address created successfully.",
                address
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get all user addresses
    async getAll(req, res, next) {
        try {
            const addresses = await addressService.getAddresses(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Addresses fetched successfully.",
                addresses
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get address by ID
    async get(req, res, next) {
        try {
            const address = await addressService.getAddressById(req.user._id, req.params.id);

            return new ApiResponse(
                res,
                200,
                "Address fetched successfully.",
                address
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Update address
    async update(req, res, next) {
        try {
            const address = await addressService.updateAddress(
                req.user._id,
                req.params.id,
                req.body
            );

            return new ApiResponse(
                res,
                200,
                "Address updated successfully.",
                address
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Delete address
    async delete(req, res, next) {
        try {
            await addressService.deleteAddress(req.user._id, req.params.id);

            return new ApiResponse(
                res,
                200,
                "Address deleted successfully."
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Set default address
    async setDefault(req, res, next) {
        try {
            const address = await addressService.setDefault(req.user._id, req.params.id);

            return new ApiResponse(
                res,
                200,
                "Default address updated successfully.",
                address
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new AddressController();
