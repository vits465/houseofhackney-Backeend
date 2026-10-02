import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "./shared/database/models.js";
import connectDatabase from "./config/Database.js";
import routes from "./routes/index.js";
import docsRouter, { sendOpenApiSpec } from "./docs/docs.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight health check endpoint (no DB blocking)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "House of Hackney Luxury eCommerce & Trade API",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "connecting/ready",
    environment: process.env.NODE_ENV || "production",
  });
});

// Direct OpenAPI specification endpoints
app.get(
  ["/docs.json", "/swagger.json", "/openapi.json", "/api/docs.json"],
  sendOpenApiSpec
);

// Modern API Documentation Hub (Scalar, Redoc, Swagger)
app.use(["/api/docs", "/docs", "/api-docs", "/reference"], docsRouter);

// Root path redirect to interactive modern docs
app.get("/", (req, res) => {
  res.redirect("/docs");
});

// Database connection assurance for Serverless & Stateful environments
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please check MONGODB_URI connection string",
    });
  }
});

// Core API Routes
app.use("/api/v1", routes);

// Global error handler (always last)
app.use(errorHandler);

export default app;