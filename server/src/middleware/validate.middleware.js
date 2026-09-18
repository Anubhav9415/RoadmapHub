"use strict";

const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Runs express-validator's validationResult().
 * On failure → 422 with the raw errors array.
 * On success → calls next().
 *
 * Place this middleware AFTER your validator chains in the route definition:
 *
 *   router.post("/register", validateSignup, validate, authController.register);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(res, 422, "Validation failed", errors.array());
  }

  next();
};

module.exports = { validate };
