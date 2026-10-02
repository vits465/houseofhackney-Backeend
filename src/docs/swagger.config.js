import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "swagger.json"), "utf-8")
);

const customCss = `
  /* House of Hackney Luxury Swagger Theme */
  :root {
    --hoh-gold: #c5a059;
    --hoh-gold-hover: #dfb974;
    --hoh-bg-dark: #0f1412;
    --hoh-bg-card: #161e1b;
    --hoh-border: #23302b;
    --hoh-text: #eaeaea;
    --hoh-text-dim: #9aa8a1;
  }

  body {
    background-color: var(--hoh-bg-dark) !important;
    color: var(--hoh-text) !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .swagger-ui .topbar {
    background-color: #080c0a !important;
    border-bottom: 2px solid var(--hoh-gold);
    padding: 14px 0;
  }

  .swagger-ui .topbar .topbar-wrapper img {
    content: url('https://res.cloudinary.com/tysd8i65/image/upload/v1/house-of-hackney-logo.png');
    height: 38px;
  }

  .swagger-ui .topbar .download-url-wrapper .select-label select {
    border: 1px solid var(--hoh-gold) !important;
    background: var(--hoh-bg-card) !important;
    color: #fff !important;
  }

  .swagger-ui .info .title {
    color: var(--hoh-gold) !important;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 32px;
    letter-spacing: 0.5px;
  }

  .swagger-ui .info p, .swagger-ui .info li {
    color: var(--hoh-text-dim) !important;
  }

  .swagger-ui .scheme-container {
    background-color: var(--hoh-bg-card) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    border-radius: 8px;
    border: 1px solid var(--hoh-border);
    margin-bottom: 25px;
  }

  .swagger-ui .opblock-tag {
    color: var(--hoh-gold) !important;
    border-bottom: 1px solid var(--hoh-border) !important;
    font-family: inherit;
    font-size: 20px;
    padding: 12px 0;
  }

  .swagger-ui .opblock {
    background: var(--hoh-bg-card) !important;
    border-radius: 8px !important;
    border: 1px solid var(--hoh-border) !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
    margin-bottom: 12px;
  }

  .swagger-ui .opblock .opblock-summary {
    padding: 10px 15px;
  }

  .swagger-ui .opblock .opblock-summary-method {
    border-radius: 6px;
    font-weight: 700;
    text-shadow: none;
    min-width: 80px;
  }

  .swagger-ui .opblock.opblock-post { border-color: #2e7d32 !important; }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #2e7d32 !important; }
  .swagger-ui .opblock.opblock-get { border-color: #1565c0 !important; }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #1565c0 !important; }
  .swagger-ui .opblock.opblock-put { border-color: #e65100 !important; }
  .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #e65100 !important; }
  .swagger-ui .opblock.opblock-delete { border-color: #c62828 !important; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #c62828 !important; }

  .swagger-ui .opblock .opblock-summary-path {
    color: #ffffff !important;
    font-weight: 600;
  }

  .swagger-ui .opblock .opblock-summary-description {
    color: var(--hoh-text-dim) !important;
  }

  .swagger-ui .btn.authorize {
    background-color: transparent !important;
    color: var(--hoh-gold) !important;
    border-color: var(--hoh-gold) !important;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .swagger-ui .btn.authorize:hover {
    background-color: var(--hoh-gold) !important;
    color: #000 !important;
  }

  .swagger-ui .btn.authorize svg {
    fill: var(--hoh-gold) !important;
  }

  .swagger-ui .btn.authorize:hover svg {
    fill: #000 !important;
  }

  .swagger-ui .btn.execute {
    background-color: var(--hoh-gold) !important;
    border-color: var(--hoh-gold) !important;
    color: #000 !important;
    font-weight: 700;
  }

  .swagger-ui .btn.execute:hover {
    background-color: var(--hoh-gold-hover) !important;
  }

  .swagger-ui section.models {
    background-color: var(--hoh-bg-card) !important;
    border: 1px solid var(--hoh-border) !important;
    border-radius: 8px;
  }

  .swagger-ui section.models h4 {
    color: var(--hoh-gold) !important;
  }

  .swagger-ui .model-box {
    background: transparent !important;
  }

  .swagger-ui table thead tr th {
    color: var(--hoh-gold) !important;
  }

  .swagger-ui .response-col_status {
    color: var(--hoh-gold) !important;
  }

  .swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select {
    background: #1c2622 !important;
    border: 1px solid var(--hoh-border) !important;
    color: #ffffff !important;
    border-radius: 4px;
  }

  .swagger-ui .dialog-ux .modal-ux {
    background: #161e1b !important;
    border: 1px solid var(--hoh-gold) !important;
  }

  .swagger-ui .dialog-ux .modal-ux-header {
    border-bottom: 1px solid var(--hoh-border) !important;
  }

  .swagger-ui .dialog-ux .modal-ux-header h3 {
    color: var(--hoh-gold) !important;
  }
`;

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerDocument, {
  customCss,
  customSiteTitle: "House of Hackney API Portal",
  customfavIcon: "https://houseofhackney.com/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    docExpansion: "none",
    tagsSorter: "alpha",
    operationsSorter: "alpha",
  },
});

export { swaggerDocument };
