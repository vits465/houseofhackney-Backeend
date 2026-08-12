import attributeService from "./attribute.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class AttributeController {

// Create Attribute
    async create(req, res, next) {
        try {

            const attribute =
                await attributeService.createAttribute({
                    ...req.body,
                    createdBy: req.user?._id,
                });

            return new ApiResponse(
                res,
                201,
                "Attribute created successfully.",
                attribute
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Get All Attributes
    async getAll(req, res, next) {
        try {

            const attributes =
                await attributeService.findAll({
                    deletedAt: null,
                });

            return new ApiResponse(
                res,
                200,
                "Attributes fetched successfully.",
                attributes
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Get Attribute By ID
    async getById(req, res, next) {
        try {

            const attribute =
                await attributeService.findById(
                    req.params.id
                );

            return new ApiResponse(
                res,
                200,
                "Attribute fetched successfully.",
                attribute
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Update Attribute
    async update(req, res, next) {
        try {

            const attribute =
                await attributeService.updateAttribute(
                    req.params.id,
                    {
                        ...req.body,
                        updatedBy: req.user?._id,
                    }
                );

            return new ApiResponse(
                res,
                200,
                "Attribute updated successfully.",
                attribute
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Delete Attribute
    async delete(req, res, next) {
        try {

            await attributeService.deleteAttribute(
                req.params.id,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Attribute deleted successfully."
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Get Attribute Values
    async getValues(req, res, next) {
        try {

            const values =
                await attributeService.getValues(
                    req.params.id
                );

            return new ApiResponse(
                res,
                200,
                "Attribute values fetched successfully.",
                values
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Add Attribute Value
    async addValue(req, res, next) {
        try {

            const attribute =
                await attributeService.addValue(
                    req.params.id,
                    req.body
                );

            return new ApiResponse(
                res,
                200,
                "Attribute value added successfully.",
                attribute
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Update Attribute Value
    async updateValue(req, res, next) {
        try {

            const attribute =
                await attributeService.updateValue(
                    req.params.id,
                    req.params.valueId,
                    req.body
                );

            return new ApiResponse(
                res,
                200,
                "Attribute value updated successfully.",
                attribute
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Delete Attribute Value
    async deleteValue(req, res, next) {
        try {

            const attribute =
                await attributeService.deleteValue(
                    req.params.id,
                    req.params.valueId
                );

            return new ApiResponse(
                res,
                200,
                "Attribute value deleted successfully.",
                attribute
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Get Variant Attributes
    async getVariantAttributes(req, res, next) {
        try {

            const attributes =
                await attributeService.getVariantAttributes();

            return new ApiResponse(
                res,
                200,
                "Variant attributes fetched successfully.",
                attributes
            ).send();

        } catch (error) {
            next(error);
        }
    }

// Get Filter Attributes
    async getFilterAttributes(req, res, next) {
        try {

            const attributes =
                await attributeService.getFilterAttributes();

            return new ApiResponse(
                res,
                200,
                "Filter attributes fetched successfully.",
                attributes
            ).send();

        } catch (error) {
            next(error);
        }
    }

}

export default new AttributeController();