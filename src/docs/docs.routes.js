import { Router } from "express";
import { apiReference } from "@scalar/express-api-reference";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { swaggerSpec } from "./swaggerSpec.js";

let swaggerDocument = swaggerSpec;
try {
  const localSwagger = path.join(__dirname, "swagger.json");
  if (fs.existsSync(localSwagger)) {
    swaggerDocument = JSON.parse(fs.readFileSync(localSwagger, "utf-8"));
  }
} catch (e) {
  console.warn("Using swaggerSpec fallback for API docs:", e.message);
}

// Ensure production Vercel and relative origin are available
swaggerDocument.servers = [
  {
    url: "https://houseofhackney-backeend.vercel.app/api/v1",
    description: "Production Server (Vercel)",
  },
  {
    url: "/api/v1",
    description: "Relative Origin (Auto)",
  },
  {
    url: "http://localhost:5000/api/v1",
    description: "Local Development Server",
  },
];

const router = Router();

export const sendOpenApiSpec = (req, res) => {
  const host = req.get("host") || "localhost:5000";
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const activeUrl = `${proto}://${host}/api/v1`;

  res.json({
    ...swaggerDocument,
    servers: [
      { url: activeUrl, description: "Active Deployment Server" },
      ...swaggerDocument.servers.filter((s) => s.url !== activeUrl),
    ],
  });
};

// 1. Raw OpenAPI Specification JSON (with dynamic host injection)
router.get(["/docs.json", "/swagger.json", "/openapi.json", "/api/docs.json"], sendOpenApiSpec);

// 2. Ultra-Modern Scalar API Reference (Default)
const scalarMiddleware = apiReference({
  spec: {
    content: swaggerDocument,
  },
  theme: "saturn",
  darkMode: true,
  pageTitle: "House of Hackney - Modern API Reference",
  showSidebar: true,
  layout: "modern",
  searchHotKey: "k",
  hideDownloadButton: false,
  hideTestRequestButton: false,
  defaultHttpClient: {
    targetKey: "javascript",
    clientKey: "fetch",
  },
  metaData: {
    title: "House of Hackney API Portal",
    description: "Interactive modern API documentation and developer portal",
  },
  customCss: `
    .scalar-api-reference {
      --scalar-color-1: #c5a059 !important;
      --scalar-button-1: #c5a059 !important;
      --scalar-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    .scalar-header {
      border-bottom: 1px solid #23302b !important;
    }
  `,
});

router.use("/scalar", scalarMiddleware);

// 3. Redoc Standalone Reader View
router.get("/redoc", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>House of Hackney - API Reference (Redoc)</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/x-icon" href="https://houseofhackney.com/favicon.ico">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #0f1412;
            font-family: 'Inter', sans-serif;
          }
          .nav-bar {
            background-color: #080c0a;
            border-bottom: 2px solid #c5a059;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .nav-title {
            color: #c5a059;
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 20px;
            font-weight: 700;
            text-decoration: none;
          }
          .nav-links a {
            color: #eaeaea;
            text-decoration: none;
            margin-left: 16px;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            background: #161e1b;
            border: 1px solid #23302b;
            transition: all 0.2s ease;
          }
          .nav-links a:hover, .nav-links a.active {
            background: #c5a059;
            color: #000;
            border-color: #c5a059;
          }
        </style>
      </head>
      <body>
        <div class="nav-bar">
          <a class="nav-title" href="/docs">House of Hackney API</a>
          <div class="nav-links">
            <a href="/docs">⚡ Modern Scalar UI</a>
            <a href="/docs/redoc" class="active">📖 Redoc View</a>
            <a href="/docs/swagger">🛠️ Swagger Explorer</a>
          </div>
        </div>
        <redoc spec-url="/docs/docs.json" theme='{
          "colors": {
            "primary": { "main": "#c5a059" },
            "success": { "main": "#2e7d32" },
            "warning": { "main": "#e65100" },
            "error": { "main": "#c62828" },
            "text": { "primary": "#eaeaea", "secondary": "#9aa8a1" },
            "http": {
              "get": "#1565c0",
              "post": "#2e7d32",
              "put": "#e65100",
              "delete": "#c62828"
            }
          },
          "typography": {
            "fontFamily": "Inter, sans-serif",
            "headings": { "fontFamily": "Playfair Display, serif" }
          },
          "sidebar": {
            "backgroundColor": "#161e1b",
            "textColor": "#eaeaea"
          },
          "rightPanel": {
            "backgroundColor": "#080c0a"
          }
        }'></redoc>
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `);
});

// 4. Swagger UI Explorer with Custom Modern Theme
const swaggerCustomCss = `
  :root {
    --hoh-gold: #c5a059;
    --hoh-gold-hover: #dfb974;
    --hoh-bg-dark: #0f1412;
    --hoh-bg-card: #161e1b;
    --hoh-border: #23302b;
    --hoh-text: #eaeaea;
    --hoh-text-dim: #9aa8a1;
  }
  body { background-color: var(--hoh-bg-dark) !important; color: var(--hoh-text) !important; font-family: 'Inter', -apple-system, sans-serif !important; }
  .swagger-ui .topbar { background-color: #080c0a !important; border-bottom: 2px solid var(--hoh-gold); padding: 12px 0; }
  .swagger-ui .info .title { color: var(--hoh-gold) !important; font-size: 28px; }
  .swagger-ui .scheme-container { background-color: var(--hoh-bg-card) !important; border-radius: 8px; border: 1px solid var(--hoh-border); }
  .swagger-ui .opblock-tag { color: var(--hoh-gold) !important; border-bottom: 1px solid var(--hoh-border) !important; font-size: 18px; }
  .swagger-ui .opblock { background: var(--hoh-bg-card) !important; border-radius: 8px !important; border: 1px solid var(--hoh-border) !important; }
  .swagger-ui .opblock .opblock-summary-path { color: #ffffff !important; font-weight: 600; }
  .swagger-ui .btn.authorize { background-color: transparent !important; color: var(--hoh-gold) !important; border-color: var(--hoh-gold) !important; }
  .swagger-ui .btn.authorize:hover { background-color: var(--hoh-gold) !important; color: #000 !important; }
  .swagger-ui .btn.execute { background-color: var(--hoh-gold) !important; border-color: var(--hoh-gold) !important; color: #000 !important; font-weight: 700; }
  .swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select { background: #1c2622 !important; border: 1px solid var(--hoh-border) !important; color: #ffffff !important; }
`;

router.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: swaggerCustomCss,
    customSiteTitle: "House of Hackney Swagger Explorer",
    customfavIcon: "https://houseofhackney.com/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: "none",
    },
  })
);

// 5. Default Documentation Landing -> Ultra-Modern Scalar UI
router.use("/", scalarMiddleware);

export default router;
export { swaggerDocument };
