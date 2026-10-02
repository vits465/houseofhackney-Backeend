import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { swaggerSpec } from "./swaggerSpec.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postmanPath = path.join(__dirname, "../postman_collections/house_master.postman_collection.json");
const postmanData = JSON.parse(fs.readFileSync(postmanPath, "utf-8"));

const tagMapping = {
  "01. Authentication & Security": "Auth & Security",
  "02. User Management": "Users",
  "03. Roles Management": "Roles & Permissions",
  "04. Permissions Management": "Roles & Permissions",
  "05. System Modules": "Roles & Permissions",
  "06. Categories Taxonomy": "Catalog - Categories",
  "07. Brands Taxonomy": "Catalog - Brands",
  "08. Products Core Engine": "Products - Core",
  "09. Product Variants": "Products - Variants",
  "10. Inventory Management": "Products - Inventory",
  "11. Attributes & Values": "Products - Attributes & Values",
  "12. Product Pricing Matrix": "Products - Pricing",
  "13. Product Media Bridge": "Products - Media",
  "14. Product Specifications": "Products - Specifications",
  "15. Product SEO Metadata": "Products - SEO",
  "16. Related Products & Cross-Sell": "Products - Related & Upsell",
  "17. Product Reviews & Ratings": "Products - Reviews & Ratings",
  "18. Faceted Aggregation Filters": "Products - Faceted Search & Filters",
  "19. Wishlist Engine": "Commerce - Wishlist",
  "20. Shopping Cart Engine": "Commerce - Shopping Cart",
  "21. Delivery Address Management": "Commerce - Addresses",
  "22. Discount Coupons": "Commerce - Coupons & Discounts",
  "23. Order Lifecycle Management": "Commerce - Orders",
  "24. Payments Processing": "Commerce - Payments",
  "25. Shipment Logistics": "Commerce - Shipments",
  "26. Tax Invoices System": "Commerce - Invoices",
  "27. B2B Trade Profiles": "B2B Trade - Profiles",
  "28. B2B Companies": "B2B Trade - Companies",
  "29. B2B Trade Tiers": "B2B Trade - Tiers",
  "30. B2B Trade Pricing": "B2B Trade - Pricing Matrix",
  "31. B2B Trade Quotations": "B2B Trade - Quotations (RFQ)",
  "32. B2B Credit Limits": "B2B Trade - Credit Limits",
  "33. Cloudinary Media Library": "Media Assets",
  "34. System Auto-Increment Counters": "System Counters",
};

const paths = {};

function processItem(item, parentTag) {
  if (item.item && Array.isArray(item.item)) {
    const currentTag = tagMapping[item.name] || parentTag || item.name.replace(/^\d+\.\s*/, "");
    item.item.forEach((sub) => processItem(sub, currentTag));
    return;
  }

  if (!item.request) return;

  const req = item.request;
  const method = req.method.toLowerCase();
  
  // Extract path
  let pathSegments = [];
  if (req.url && req.url.path) {
    pathSegments = req.url.path;
  } else if (req.url && req.url.raw) {
    const cleanUrl = req.url.raw.replace(/\{\{baseUrl\}\}\/?/, "");
    pathSegments = cleanUrl.split("/").filter(Boolean);
  }

  // Convert postman variables (:id or {{id}} or :productId) to OpenAPI style ({id}, {productId})
  const openApiPath = "/" + pathSegments.map((segment) => {
    if (segment.startsWith(":")) {
      return `{${segment.slice(1)}}`;
    }
    if (segment.startsWith("{{") && segment.endsWith("}}")) {
      return `{${segment.slice(2, -2)}}`;
    }
    return segment;
  }).join("/");

  if (!paths[openApiPath]) {
    paths[openApiPath] = {};
  }

  // Extract path and query parameters
  const parameters = [];

  // Path parameters from the path itself
  const pathParamsMatches = openApiPath.match(/\{([^}]+)\}/g);
  if (pathParamsMatches) {
    pathParamsMatches.forEach((paramWithBrackets) => {
      const paramName = paramWithBrackets.slice(1, -1);
      parameters.push({
        name: paramName,
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
        description: `Identifier for ${paramName}`,
      });
    });
  }

  // Query parameters
  if (req.url && req.url.query && Array.isArray(req.url.query)) {
    req.url.query.forEach((q) => {
      parameters.push({
        name: q.key,
        in: "query",
        required: false,
        schema: {
          type: "string",
          default: q.value || undefined,
        },
        description: q.description || `Filter/Query parameter: ${q.key}`,
      });
    });
  }

  // Request Body
  let requestBody = undefined;
  if (["post", "put", "patch"].includes(method) && req.body) {
    if (req.body.mode === "raw" && req.body.raw) {
      try {
        const parsedJson = JSON.parse(req.body.raw);
        requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                example: parsedJson,
              },
            },
          },
        };
      } catch (e) {
        requestBody = {
          content: {
            "application/json": {
              schema: {
                type: "object",
                example: req.body.raw,
              },
            },
          },
        };
      }
    } else if (req.body.mode === "formdata" && req.body.formdata) {
      const properties = {};
      req.body.formdata.forEach((field) => {
        if (field.type === "file") {
          properties[field.key] = {
            type: "string",
            format: "binary",
            description: "Binary file upload",
          };
        } else {
          properties[field.key] = {
            type: "string",
            example: field.value || "",
          };
        }
      });

      requestBody = {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties,
            },
          },
        },
      };
    }
  }

  const operation = {
    tags: [parentTag || "General"],
    summary: item.name,
    description: req.description || `${item.name} endpoint in ${parentTag || "General"}.`,
    parameters: parameters.length > 0 ? parameters : undefined,
    requestBody,
    responses: {
      "200": {
        description: "Successful response",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/StandardResponse",
            },
          },
        },
      },
      "400": {
        description: "Bad request / Validation error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
      "401": {
        description: "Unauthorized / Missing or invalid token",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
      "403": {
        description: "Forbidden / Insufficient permissions",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
      "404": {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
    },
  };

  paths[openApiPath][method] = operation;
}

postmanData.item.forEach((folder) => processItem(folder));

const fullSwaggerSpec = {
  ...swaggerSpec,
  paths,
};

const outputPath = path.join(__dirname, "swagger.json");
fs.writeFileSync(outputPath, JSON.stringify(fullSwaggerSpec, null, 2), "utf-8");

console.log(`✅ Successfully generated swagger.json with ${Object.keys(paths).length} unique API paths!`);
