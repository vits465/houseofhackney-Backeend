import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "./shared/database/models.js";
import connectDatabase from "./config/Database.js";
import routes from "./routes/index.js";
import docsRouter, { sendOpenApiSpec } from "./docs/docs.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import crypto from "crypto";
import Razorpay from "razorpay";
import emailService from "./modules/auth/otp/email.service.js";

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

// Razorpay Standard Checkout Endpoints
const handleCreateOrder = async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body || {};
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount parameter" });
    }
    const numAmount = Math.round(Number(amount));
    if (numAmount < 100) {
      return res.status(400).json({ success: false, message: "Amount must be at least 100 paise" });
    }
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_TsSGM70azhrLSg";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "bwguUzmvy7gcrj7kVlhRBwyB";
    if (!key_id || !key_secret) {
      return res.status(500).json({ success: false, message: "Razorpay credentials not configured" });
    }
    const instance = new Razorpay({ key_id, key_secret });
    const order = await instance.orders.create({
      amount: numAmount,
      currency: currency || "INR",
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    });
    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      id: order.id,
    });
  } catch (error) {
    if (
      error.statusCode === 401 ||
      error.status === 401 ||
      (error.error && error.error.code === "BAD_REQUEST_ERROR" && error.statusCode === 401) ||
      error.message?.toLowerCase().includes("auth")
    ) {
      return res.status(401).json({ success: false, message: "Razorpay authentication failed" });
    }
    return res.status(500).json({ success: false, message: error.message || "Failed to create Razorpay order" });
  }
};

const handleVerifyPayment = (req, res) => {
  try {
    const order_id = req.body?.order_id || req.body?.razorpay_order_id;
    const payment_id = req.body?.payment_id || req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature || req.body?.signature;

    if (!order_id || !payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: order_id, payment_id, and razorpay_signature are required",
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || "bwguUzmvy7gcrj7kVlhRBwyB";
    if (!key_secret) {
      return res.status(500).json({ success: false, message: "RAZORPAY_KEY_SECRET is not configured" });
    }

    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment signature verification failed" });
    }

    return res.status(200).json({ success: true, message: "Payment signature verified successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const handleSendOrderConfirmation = async (req, res) => {
  try {
    const { order, recipientEmail, recipientName } = req.body || {};
    const to = recipientEmail || order?.shippingAddress?.email || order?.user?.email;
    if (!to) {
      return res.status(400).json({ success: false, message: "Recipient email is required" });
    }
    const name = recipientName || order?.shippingAddress?.fullName || order?.user?.name || "Valued Patron";
    const result = await emailService.sendOrderConfirmationEmail({
      to,
      name,
      order: order || {},
    });
    return res.status(200).json({
      success: true,
      message: "Order confirmation email dispatched successfully",
      data: result,
    });
  } catch (err) {
    console.error("❌ Send order confirmation error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

app.post(["/api/create-order", "/api/v1/create-order", "/api/v1/payments/create-order"], handleCreateOrder);
app.post(["/api/verify-payment", "/api/v1/verify-payment", "/api/v1/payments/verify-payment"], handleVerifyPayment);
app.post(
  [
    "/api/send-order-confirmation",
    "/api/v1/orders/send-confirmation",
    "/api/orders/send-confirmation",
    "/api/v1/send-order-confirmation",
  ],
  handleSendOrderConfirmation
);

// Database connection assurance for Serverless & Stateful environments
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Core API Routes
app.use("/api/v1", routes);

// Global error handler (always last)
app.use(errorHandler);

export default app;