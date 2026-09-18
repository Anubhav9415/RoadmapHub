"use strict";

const { errorResponse } = require("../utils/apiResponse");

/**
 * Global Express error handler.
 *
 * MUST be the last middleware registered in app.js:
 *   app.use(errorHandler);
 *
 * Normalises all thrown errors into consistent errorResponse() shapes.
 * Covers:
 *   - Mongoose CastError        → 400 Bad Request
 *   - Mongoose ValidationError  → 422 Unprocessable Entity
 *   - Mongoose duplicate key    → 409 Conflict
 *   - JWT errors                → 401 Unauthorised
 *   - Custom AppError           → err.statusCode
 *   - Everything else           → 500 Internal Server Error
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal Server Error";

  // ── Mongoose: invalid ObjectId ────────────────────────────────────────────
  if (err.name === "CastError") {
    statusCode = 400;
    message    = `Invalid value for field '${err.path}': ${err.value}.`;
  }

  // ── Mongoose: schema validation failed ───────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 422;
    message    = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── Mongoose: duplicate unique key ────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    statusCode  = 409;
    message     = `A record with that ${field} already exists.`;
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") { statusCode = 401; message = "Invalid token."; }
  if (err.name === "TokenExpiredError") { statusCode = 401; message = "Token has expired."; }

  // ── Dev logging ───────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.error(`\n[ERROR] ${statusCode} — ${message}`);
    console.error(err.stack, "\n");
  }

  return errorResponse(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === "development" ? [err.stack] : []
  );
};

module.exports = errorHandler;
