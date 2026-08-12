import filterService from "./filter.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class FilterController {
  // Get Grouped Product Facets (For Storefront Sidebar)
  getFacets = async (req, res, next) => {
    try {
      const facets = await filterService.getGroupedFacets(req.query);
      return new ApiResponse(res, 200, "Grouped facets fetched successfully.", facets).send();
    } catch (error) {
      next(error);
    }
  };

  // Filter & Search Products using Aggregation Pipeline
  filterProducts = async (req, res, next) => {
    try {
      const result = await filterService.searchAndFilterProducts(req.query);
      return new ApiResponse(res, 200, "Filtered products fetched successfully.", result).send();
    } catch (error) {
      next(error);
    }
  };

  // Get All Custom Filter Groups (Admin)
  getFilterGroups = async (req, res, next) => {
    try {
      const groups = await filterService.getFilterGroups();
      return new ApiResponse(res, 200, "Filter groups fetched successfully.", groups).send();
    } catch (error) {
      next(error);
    }
  };

  // Create Custom Filter Group (Admin)
  createFilterGroup = async (req, res, next) => {
    try {
      const group = await filterService.createFilterGroup(req.body);
      return new ApiResponse(res, 201, "Filter group created successfully.", group).send();
    } catch (error) {
      next(error);
    }
  };

  // Update Filter Group (Admin)
  updateFilterGroup = async (req, res, next) => {
    try {
      const group = await filterService.updateFilterGroup(req.params.id, req.body);
      return new ApiResponse(res, 200, "Filter group updated successfully.", group).send();
    } catch (error) {
      next(error);
    }
  };

  // Delete Filter Group (Admin)
  deleteFilterGroup = async (req, res, next) => {
    try {
      await filterService.deleteFilterGroup(req.params.id);
      return new ApiResponse(res, 200, "Filter group deleted successfully.").send();
    } catch (error) {
      next(error);
    }
  };
}

export default new FilterController();
