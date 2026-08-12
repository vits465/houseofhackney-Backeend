import mongoose from "mongoose";
import BaseService from "../../../shared/database/BaseService.js";
import filterRepository from "./filter.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class FilterService extends BaseService {
  constructor() {
    super(filterRepository);
  }

  /**
   * Builds MongoDB $match pipeline stage from REST query parameters
   */
  buildMatchStage(query = {}) {
    const match = {};

    // Categories (comma-separated or single string)
    if (query.category) {
      const categories = query.category
        .split(",")
        .map((c) => c.trim())
        .filter((c) => mongoose.Types.ObjectId.isValid(c))
        .map((c) => new mongoose.Types.ObjectId(c));
      if (categories.length > 0) {
        match.category = { $in: categories };
      }
    }

    // Brands
    if (query.brand) {
      const brands = query.brand
        .split(",")
        .map((b) => b.trim())
        .filter((b) => mongoose.Types.ObjectId.isValid(b))
        .map((b) => new mongoose.Types.ObjectId(b));
      if (brands.length > 0) {
        match.brand = { $in: brands };
      }
    }

    // Price Range (basePrice)
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      match.basePrice = {};
      if (query.minPrice !== undefined && !isNaN(Number(query.minPrice))) {
        match.basePrice.$gte = Number(query.minPrice);
      }
      if (query.maxPrice !== undefined && !isNaN(Number(query.maxPrice))) {
        match.basePrice.$lte = Number(query.maxPrice);
      }
    }

    // Colours
    if (query.colours) {
      const colours = query.colours
        .split(",")
        .map((c) => c.trim())
        .filter((c) => mongoose.Types.ObjectId.isValid(c))
        .map((c) => new mongoose.Types.ObjectId(c));
      if (colours.length > 0) {
        match.colours = { $in: colours };
      }
    }

    // Materials
    if (query.material) {
      const materials = query.material
        .split(",")
        .map((m) => m.trim())
        .filter((m) => mongoose.Types.ObjectId.isValid(m))
        .map((m) => new mongoose.Types.ObjectId(m));
      if (materials.length > 0) {
        match.material = { $in: materials };
      }
    }

    // Styles
    if (query.styles) {
      const styles = query.styles
        .split(",")
        .map((s) => s.trim())
        .filter((s) => mongoose.Types.ObjectId.isValid(s))
        .map((s) => new mongoose.Types.ObjectId(s));
      if (styles.length > 0) {
        match.styles = { $in: styles };
      }
    }

    // Rooms
    if (query.rooms) {
      const rooms = query.rooms
        .split(",")
        .map((r) => r.trim())
        .filter((r) => mongoose.Types.ObjectId.isValid(r))
        .map((r) => new mongoose.Types.ObjectId(r));
      if (rooms.length > 0) {
        match.rooms = { $in: rooms };
      }
    }

    // Product Type
    if (query.productType) {
      const types = query.productType.split(",").map((t) => t.trim());
      match.productType = { $in: types };
    }

    // Availability / Status Flags
    if (query.isFeatured !== undefined) {
      match.isFeatured = query.isFeatured === "true" || query.isFeatured === true;
    }
    if (query.isBestSeller !== undefined) {
      match.isBestSeller = query.isBestSeller === "true" || query.isBestSeller === true;
    }
    if (query.isNewArrival !== undefined) {
      match.isNewArrival = query.isNewArrival === "true" || query.isNewArrival === true;
    }
    if (query.isTradeAvailable !== undefined) {
      match.isTradeAvailable = query.isTradeAvailable === "true" || query.isTradeAvailable === true;
    }

    // Search Keyword Text Match
    if (query.search && query.search.trim() !== "") {
      const searchRegex = new RegExp(query.search.trim(), "i");
      match.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex },
        { searchKeywords: searchRegex },
      ];
    }

    return match;
  }

  /**
   * Helper to build MongoDB $sort stage
   */
  buildSortStage(sortParam = "newest") {
    switch (sortParam) {
      case "price_asc":
        return { basePrice: 1 };
      case "price_desc":
        return { basePrice: -1 };
      case "name_asc":
        return { name: 1 };
      case "name_desc":
        return { name: -1 };
      case "newest":
      default:
        return { createdAt: -1 };
    }
  }

  /**
   * Returns Dynamic Facets for Storefront Catalog Sidebar
   */
  async getGroupedFacets(queryParams = {}) {
    const matchStage = this.buildMatchStage(queryParams);
    return filterRepository.getGroupedProductFacets(matchStage);
  }

  /**
   * Executes Filtered Product Search Pipeline with Pagination
   */
  async searchAndFilterProducts(queryParams = {}) {
    const matchStage = this.buildMatchStage(queryParams);
    const sortStage = this.buildSortStage(queryParams.sort);
    const page = parseInt(queryParams.page || "1", 10);
    const limit = parseInt(queryParams.limit || "12", 10);

    return filterRepository.aggregateFilteredProducts({
      matchStage,
      sortStage,
      page,
      limit,
    });
  }

  // Filter Group Admin Methods
  async createFilterGroup(groupData) {
    const exists = await this.repository.findOne({ code: groupData.code.toLowerCase() });
    if (exists) {
      throw new AppError("Filter group code already exists.", 409);
    }
    return this.repository.create(groupData);
  }

  async getFilterGroups() {
    return this.repository.findAll({ isActive: true }, null, { sort: { displayOrder: 1 } });
  }

  async updateFilterGroup(id, updateData) {
    const group = await this.repository.findById(id);
    if (!group) {
      throw new AppError("Filter group not found.", 404);
    }
    return this.repository.update(id, updateData);
  }

  async deleteFilterGroup(id) {
    const group = await this.repository.findById(id);
    if (!group) {
      throw new AppError("Filter group not found.", 404);
    }
    return this.repository.delete(id);
  }
}

export default new FilterService();
