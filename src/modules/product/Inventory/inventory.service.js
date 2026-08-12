import BaseService from "../../../shared/database/BaseService.js";

import inventoryRepository from "./inventory.repository.js";
import productRepository from "../product/product.repository.js";

import AppError from "../../../shared/errors/AppError.js";

class InventoryService extends BaseService {

    constructor() {
        super(inventoryRepository);
    }

// Calculate Available S
    tockcalculateAvailableStock(stock, reservedStock) {
        return Math.max(stock - reservedStock, 0);
    }

// Calculate Stock S
    tatuscalculateStockStatus(
        stock,
        minimumStock,
        allowBackorder
    ) {

        if (stock <= 0) {
            return allowBackorder
                ? "PREORDER"
                : "OUT_OF_STOCK";
        }

        if (stock <= minimumStock) {
            return "LOW_STOCK";
        }

        return "IN_STOCK";

    }

// Create Inventory
    async createInventory(inventoryData) {

        const product = await productRepository.findById(
            inventoryData.product
        );

        if (!product) {
            throw new AppError(
                "Product not found.",
                404
            );
        }

        const exists =
            await this.repository.existsByProduct(
                inventoryData.product
            );

        if (exists) {
            throw new AppError(
                "Inventory already exists for this product.",
                409
            );
        }

        inventoryData.availableStock =
            this.calculateAvailableStock(
                inventoryData.stock,
                inventoryData.reservedStock
            );

        inventoryData.stockStatus =
            this.calculateStockStatus(
                inventoryData.stock,
                inventoryData.minimumStock,
                inventoryData.allowBackorder
            );

        return await this.repository.create(
            inventoryData
        );

    }

// Get Inventory
    async getInventory(productId) {

        return await this.repository.findByProduct(
            productId
        );

    }

// Update Inventory
    async updateInventory(productId, updateData) {

        const inventory =
            await this.repository.findByProduct(
                productId
            );

        if (!inventory) {
            throw new AppError(
                "Inventory not found.",
                404
            );
        }

        const stock =
            updateData.stock ?? inventory.stock;

        const reservedStock =
            updateData.reservedStock ??
            inventory.reservedStock;

        const minimumStock =
            updateData.minimumStock ??
            inventory.minimumStock;

        const allowBackorder =
            updateData.allowBackorder ??
            inventory.allowBackorder;

        updateData.availableStock =
            this.calculateAvailableStock(
                stock,
                reservedStock
            );

        updateData.stockStatus =
            this.calculateStockStatus(
                stock,
                minimumStock,
                allowBackorder
            );

        return await this.repository.update(
            inventory._id,
            updateData
        );

    }

// Delete Inventory
    async deleteInventory(productId, deletedBy) {

        const inventory =
            await this.repository.findByProduct(
                productId
            );

        if (!inventory) {
            throw new AppError(
                "Inventory not found.",
                404
            );
        }

        return await this.repository.softDelete(
            inventory._id,
            {
                updatedBy: deletedBy,
            }
        );

    }

}

export default new InventoryService();