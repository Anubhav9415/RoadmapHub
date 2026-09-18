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

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      await seedAdmin();
      isConnected = true;
    } catch (err) {
      console.error("❌ DB connection failed:", err.message);
      return res.status(500).json({
        success: false,
        message: "Database connection failed. Please try again later.",
      });
    }
  }

  // Delegate to the Express app
  return app(req, res);
};
