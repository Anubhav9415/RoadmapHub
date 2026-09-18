"use strict";

/**
 * Vercel Serverless Entry Point
 * Wraps the Express app for Vercel's serverless runtime.
 * MongoDB connection is cached across warm invocations.
 */

require("dotenv").config();

const app       = require("../app");
const connectDB = require("../src/config/db");
const seedAdmin = require("../src/utils/seedAdmin");

// Cache the DB connection across serverless invocations (warm starts)
let isConnected = false;

// Helper: set CORS headers manually so they are present even on crashes
function setCorsHeaders(req, res) {
  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
}

module.exports = async (req, res) => {
  // Always set CORS headers first — even if we crash below
  setCorsHeaders(req, res);

  // Handle preflight OPTIONS requests immediately
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!isConnected) {
    try {
      await connectDB();
      await seedAdmin();
      isConnected = true;
    } catch (err) {
      console.error("❌ DB connection failed:", err.message);
      return res.status(500).json({
        success: false,
        message: "Database connection failed. Check MONGODB_URI environment variable.",
        hint: err.message,
      });
    }
  }

  // Delegate to the Express app
  return app(req, res);
};
