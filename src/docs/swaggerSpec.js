export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "House of Hackney - Luxury eCommerce & B2B Trade API",
    version: "1.0.0",
    description: `## House of Hackney Comprehensive API Documentation
Welcome to the API specification for House of Hackney Backend.

### Key Highlights:
- **Authentication**: JWT Bearer Tokens with Refresh Token Rotation & Session Tracking.
- **Entity Population**: All relational responses automatically return full populated objects.
- **B2B Trade Engine**: Company accounts, custom discount tiers, negotiated pricing matrix, RFQ quotations, and credit limits.
- **Rich Catalog**: Faceted aggregation search, multi-currency pricing, inventory sync, variant combinations, and Cloudinary media integration.

### Quick Start:
1. Log in via \`POST /api/v1/auth/login\` or create an account via \`POST /api/v1/auth/register\`.
2. Copy the returned \`accessToken\`.
3. Click the **Authorize** button at the top-right and enter: \`Bearer <your_token>\` or simply paste \`<your_token>\`.
`,
    contact: {
      name: "House of Hackney Engineering Support",
      email: "adichauha465@gmail.com",
    },
  },
  servers: [
    {
      url: "https://houseofhackney-backeend.vercel.app/api/v1",
      description: "Production Server (Vercel)",
    },
    {
      url: "/api/v1",
      description: "Relative Origin Server",
    },
    {
      url: "http://localhost:5000/api/v1",
      description: "Local Development Server (API v1)",
    },
  ],
  tags: [
    { name: "Auth & Security", description: "Authentication, Registration, OTPs, Passwords & Sessions" },
    { name: "Users", description: "User Management, Profiles & RBAC" },
    { name: "Roles & Permissions", description: "Access Control, System Roles, Capabilities & Modules" },
    { name: "Catalog - Categories", description: "Hierarchical Categories, Trees & Navigation Menus" },
    { name: "Catalog - Brands", description: "Brand Partners, Manufacturers & Heritage Portfolios" },
    { name: "Products - Core", description: "Product Catalog, Taxonomy & Publishing Engine" },
    { name: "Products - Variants", description: "SKUs, Colorways, Sizes & Default Selections" },
    { name: "Products - Pricing", description: "Base Retail Pricing, Margins & Tax Classes" },
    { name: "Products - Inventory", description: "Stock Levels, Reservations, Backorders & Low Stock Alerts" },
    { name: "Products - Media", description: "Primary Imagery, Gallery Banners & Video Assets" },
    { name: "Products - Specifications", description: "Technical Dimensions, Materials, Care & Origin Info" },
    { name: "Products - SEO", description: "Metadata, OpenGraph & Search Index Optimization" },
    { name: "Products - Related & Upsell", description: "Cross-Sell Items, Complementary Styles & Bundles" },
    { name: "Products - Reviews & Ratings", description: "Customer Feedback, Moderation, Likes & Replies" },
    { name: "Products - Attributes & Values", description: "Dynamic Facet Attributes, Swatches & Configurable Options" },
    { name: "Products - Faceted Search & Filters", description: "High-Performance Aggregated Facets & Multi-criteria Search" },
    { name: "Commerce - Shopping Cart", description: "Real-time Cart Calculations, Line Discounts & Taxes" },
    { name: "Commerce - Wishlist", description: "Saved Customer Favorites & Saved Collections" },
    { name: "Commerce - Addresses", description: "Shipping & Billing Address Book" },
    { name: "Commerce - Coupons & Discounts", description: "Promotional Codes, Tiered Discounts & Validity" },
    { name: "Commerce - Orders", description: "Order Processing, Life Cycle, Tracking & Itemization" },
    { name: "Commerce - Payments", description: "Payment Intents, Gateway Transactions & Audit Logs" },
    { name: "Commerce - Shipments", description: "Couriers, Tracking Numbers & Logistics Status" },
    { name: "Commerce - Invoices", description: "Official Tax Invoices, PDF Links & Paid Receipts" },
    { name: "B2B Trade - Profiles", description: "Trade Program Membership, Approvals & Tier Assignments" },
    { name: "B2B Trade - Companies", description: "Corporate Entities, VAT IDs & Business Registrations" },
    { name: "B2B Trade - Tiers", description: "Wholesale Discount Levels & Credit Thresholds" },
    { name: "B2B Trade - Pricing Matrix", description: "Contracted Tier Pricing for Products & Variants" },
    { name: "B2B Trade - Quotations (RFQ)", description: "Request for Quotes, Price Negotiations & Order Conversions" },
    { name: "B2B Trade - Credit Limits", description: "Post-paid Line of Credit, Available Balances & Adjustments" },
    { name: "Media Assets", description: "Cloudinary CDN Uploads & Asset Registry" },
    { name: "System Counters", description: "Atomic Auto-Increment SKUs & Order Numbers" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT Access Token retrieved from `/auth/login` or `/auth/register`",
      },
    },
    schemas: {
      StandardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully." },
          data: { type: "object" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Resource not found or invalid input." },
          statusCode: { type: "integer", example: 400 },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};
