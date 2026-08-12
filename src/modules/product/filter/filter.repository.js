import BaseRepository from "../../../shared/database/BaseRepository.js";
import FilterGroup from "./filter.model.js";
import Product from "../product/product.model.js";

class FilterRepository extends BaseRepository {
  constructor() {
    super(FilterGroup);
  }

  /**
   * MongoDB Aggregation Pipeline for Facet Grouping & Facet Counts
   * @param {Object} matchStage - MongoDB $match condition
   */
  async getGroupedProductFacets(matchStage = {}) {
    const { basePrice, ...productMatch } = matchStage;

    const pipeline = [
      { $match: { ...productMatch, status: "PUBLISHED", deletedAt: null } },
      {
        $lookup: {
          from: "productpricings",
          localField: "_id",
          foreignField: "product",
          as: "pricingInfo",
        },
      },
      {
        $addFields: {
          effectivePrice: {
            $ifNull: [
              { $arrayElemAt: ["$pricingInfo.sellingPrice", 0] },
              { $ifNull: ["$basePrice", 0] },
            ],
          },
        },
      },
      {
        $facet: {
          // Price Bounds
          priceRange: [
            {
              $group: {
                _id: null,
                minPrice: { $min: "$effectivePrice" },
                maxPrice: { $max: "$effectivePrice" },
              },
            },
            {
              $project: {
                _id: 0,
                minPrice: { $ifNull: ["$minPrice", 0] },
                maxPrice: { $ifNull: ["$maxPrice", 0] },
              },
            },
          ],

          // Categories Facet
          categories: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
            {
              $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "categoryDetails",
              },
            },
            { $unwind: "$categoryDetails" },
            {
              $project: {
                _id: "$categoryDetails._id",
                name: "$categoryDetails.name",
                slug: "$categoryDetails.slug",
                count: 1,
              },
            },
            { $sort: { count: -1, name: 1 } },
          ],

          // Brands Facet
          brands: [
            { $match: { brand: { $ne: null } } },
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            {
              $lookup: {
                from: "brands",
                localField: "_id",
                foreignField: "_id",
                as: "brandDetails",
              },
            },
            { $unwind: "$brandDetails" },
            {
              $project: {
                _id: "$brandDetails._id",
                name: "$brandDetails.name",
                slug: "$brandDetails.slug",
                count: 1,
              },
            },
            { $sort: { count: -1, name: 1 } },
          ],

          // Colours Facet
          colours: [
            { $unwind: "$colours" },
            { $group: { _id: "$colours", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          // Materials Facet
          materials: [
            { $match: { material: { $ne: null } } },
            { $group: { _id: "$material", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          // Styles Facet
          styles: [
            { $unwind: "$styles" },
            { $group: { _id: "$styles", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          // Rooms Facet
          rooms: [
            { $unwind: "$rooms" },
            { $group: { _id: "$rooms", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          // Product Types Facet
          productTypes: [
            { $group: { _id: "$productType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          // Availability Flags Facet
          availability: [
            {
              $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                featuredCount: { $sum: { $cond: ["$isFeatured", 1, 0] } },
                bestSellerCount: { $sum: { $cond: ["$isBestSeller", 1, 0] } },
                newArrivalCount: { $sum: { $cond: ["$isNewArrival", 1, 0] } },
                tradeAvailableCount: { $sum: { $cond: ["$isTradeAvailable", 1, 0] } },
              },
            },
            { $project: { _id: 0 } },
          ],
        },
      },
    ];

    const [result] = await Product.aggregate(pipeline);

    return {
      priceRange: result?.priceRange[0] || { minPrice: 0, maxPrice: 0 },
      categories: result?.categories || [],
      brands: result?.brands || [],
      colours: result?.colours || [],
      materials: result?.materials || [],
      styles: result?.styles || [],
      rooms: result?.rooms || [],
      productTypes: result?.productTypes || [],
      availability: result?.availability[0] || {
        totalProducts: 0,
        featuredCount: 0,
        bestSellerCount: 0,
        newArrivalCount: 0,
        tradeAvailableCount: 0,
      },
    };
  }

  /**
   * MongoDB Aggregation Pipeline for Filtered Product Search & Pagination
   */
  async aggregateFilteredProducts({ matchStage = {}, sortStage = { createdAt: -1 }, page = 1, limit = 12 }) {
    const skip = (page - 1) * limit;
    const { basePrice, ...productMatch } = matchStage;
    const priceMatch = basePrice ? { price: basePrice } : {};

    const pipeline = [
      { $match: { ...productMatch, status: "PUBLISHED", deletedAt: null } },
      {
        $lookup: {
          from: "productpricings",
          localField: "_id",
          foreignField: "product",
          as: "pricingInfo",
        },
      },
      {
        $addFields: {
          price: {
            $ifNull: [
              { $arrayElemAt: ["$pricingInfo.sellingPrice", 0] },
              { $ifNull: ["$basePrice", 0] },
            ],
          },
        },
      },
      { $match: priceMatch },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "brands",
                localField: "brand",
                foreignField: "_id",
                as: "brand",
              },
            },
            { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
          ],
        },
      },
    ];

    const [result] = await Product.aggregate(pipeline);

    const total = result?.metadata[0]?.total || 0;
    const data = result?.data || [];

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export default new FilterRepository();
