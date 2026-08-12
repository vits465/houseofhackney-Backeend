import inventoryService from "./inventory.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class InventoryController {

    async create(req, res, next) {

        try {

            const inventory =
                await inventoryService.createInventory({
                    ...req.body,
                    createdBy: req.user?._id,
                });

            return new ApiResponse(
                res,
                201,
                "Inventory created successfully.",
                inventory
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async get(req, res, next) {

        try {

            const inventory =
                await inventoryService.getInventory(
                    req.params.productId
                );

            return new ApiResponse(
                res,
                200,
                "Inventory fetched successfully.",
                inventory
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async update(req, res, next) {

        try {

            const inventory =
                await inventoryService.updateInventory(
                    req.params.productId,
                    {
                        ...req.body,
                        updatedBy: req.user?._id,
                    }
                );

            return new ApiResponse(
                res,
                200,
                "Inventory updated successfully.",
                inventory
            ).send();

        } catch (error) {
            next(error);
        }

    }

    async delete(req, res, next) {

        try {

            await inventoryService.deleteInventory(
                req.params.productId,
                req.user?._id
            );

            return new ApiResponse(
                res,
                200,
                "Inventory deleted successfully."
            ).send();

        } catch (error) {
            next(error);
        }

    }

}

export default new InventoryController();