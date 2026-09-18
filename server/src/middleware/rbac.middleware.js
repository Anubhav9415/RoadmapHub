"use strict";

const { errorResponse } = require("../utils/apiResponse");

/**
 * requireAdmin — gate a route to admin users only.
 *
 * Must be placed AFTER protect() in the middleware chain:
 *   router.get("/stats", protect, requireAdmin, adminController.getDashboardStats);
 *
 * Reads req.user.role (set by protect() from the JWT payload).
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, "Authentication required.");
  }

  if (req.user.role !== "admin") {
    return errorResponse(
      res,
      403,
      "Forbidden — admin access required."
    );
  }

  next();
};

module.exports = { requireAdmin };
