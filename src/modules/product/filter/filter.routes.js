import { Router } from "express";
import filterController from "./filter.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";
import { filterGroupValidation, facetQueryValidation } from "./filter.validation.js";

const router = Router();

// Storefront Public Aggregation Pipeline & Search APIs
router.get("/facets", facetQueryValidation, validateRequest, filterController.getFacets);
router.get("/products", facetQueryValidation, validateRequest, filterController.filterProducts);

// Dynamic Filter Group Management (Admin & Public Reads)
router.get("/", filterController.getFilterGroups);

router.use(authMiddleware);

router.post("/", filterGroupValidation, validateRequest, filterController.createFilterGroup);
router.put("/:id", filterGroupValidation, validateRequest, filterController.updateFilterGroup);
router.delete("/:id", filterController.deleteFilterGroup);

export default router;
