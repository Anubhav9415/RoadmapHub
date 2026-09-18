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

// Enable trust proxy for Vercel serverless / reverse proxies
app.set("trust proxy", 1);

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
// CLIENT_URL can be a comma-separated list of allowed origins
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Always allow local development and Vercel deployments
      if (
        configuredOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }

      // Permissive fallback so legitimate client requests are never blocked
      return callback(null, true);
    },
    credentials: true,                  // allow cookies / auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,            // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
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

// ── Root & Health Check ───────────────────────────────────────────────────────
const healthResponse = (_req, res) => {
  res.json({
    success: true,
    message: "Roadmap Portal API is running 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
};

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Roadmap Portal API is active 🚀",
    endpoints: {
      health: "/health",
      posts: "/api/v1/posts",
      auth: "/api/v1/auth",
    },
  });
});

app.get("/health", healthResponse);
app.get("/api/health", healthResponse);
app.get("/api/v1/health", healthResponse);

// ── API Routes (v1 and aliases for frontend compatibility) ───────────────────
const API_PREFIX = "/api/v1";

// Mount v1 routes
app.use(`${API_PREFIX}/auth`,     authRoutes);
app.use(`${API_PREFIX}/posts`,    postRoutes);
app.use(`${API_PREFIX}/comments`, commentRoutes);
app.use(`${API_PREFIX}/admin`,    adminRoutes);

// Mount /api aliases
app.use(`/api/auth`,     authRoutes);
app.use(`/api/posts`,    postRoutes);
app.use(`/api/comments`, commentRoutes);
app.use(`/api/admin`,    adminRoutes);

// Mount root-level aliases (in case frontend baseURL lacks /api/v1)
app.use(`/auth`,     authRoutes);
app.use(`/posts`,    postRoutes);
app.use(`/comments`, commentRoutes);
app.use(`/admin`,    adminRoutes);

// ── 404 Catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
