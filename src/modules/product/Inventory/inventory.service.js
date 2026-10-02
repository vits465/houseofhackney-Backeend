import BaseService from "../../../shared/database/BaseService.js";

import inventoryRepository from "./inventory.repository.js";
import productRepository from "../product/product.repository.js";

import AppError from "../../../shared/errors/AppError.js";

class InventoryService extends BaseService {

    constructor() {
        super(inventoryRepository);
    }

// Calculate Available Stock
    calculateAvailableStock(stock, reservedStock = 0) {
        return Math.max(stock - reservedStock, 0);
    }

// Calculate Stock Status
    calculateStockStatus(
        stock,
        minimumStock = 10,
        allowBackorder = false
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
                inventoryData.stock || inventoryData.totalStock || 0,
                inventoryData.reservedStock || 0
            );

        inventoryData.stockStatus =
            this.calculateStockStatus(
                inventoryData.stock || inventoryData.totalStock || 0,
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
            updateData.stock ?? updateData.totalStock ?? inventory.totalStock ?? inventory.stock ?? 0;

        const reservedStock =
            updateData.reservedStock ??
            inventory.reservedStock ?? 0;

        const minimumStock =
            updateData.minimumStock ??
            inventory.minimumStock ?? 10;

        const allowBackorder =
            updateData.allowBackorder ??
            inventory.allowBackorder ?? false;

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