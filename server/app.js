"use strict";

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// ── Route Imports ────────────────────────────────────────────────────────────
const authRoutes    = require("./src/routes/auth.routes");
const postRoutes    = require("./src/routes/post.routes");
const commentRoutes = require("./src/routes/comment.routes");
const adminRoutes   = require("./src/routes/admin.routes");

// ── Error Handler ────────────────────────────────────────────────────────────
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,                  // allow cookies / auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,            // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use("/api", apiLimiter);

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Roadmap Portal API is running 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes (v1) ───────────────────────────────────────────────────────────
const API_PREFIX = "/api/v1";

app.use(`${API_PREFIX}/auth`,     authRoutes);
app.use(`${API_PREFIX}/posts`,    postRoutes);
app.use(`${API_PREFIX}/comments`, commentRoutes);
app.use(`${API_PREFIX}/admin`,    adminRoutes);

// ── 404 Catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
