"use strict";

/**
 * Send a standardised success response.
 *
 * Shape: { success: true, message, data }
 *
 * @param {import('express').Response} res
 * @param {number} statusCode  - HTTP status (200, 201, etc.)
 * @param {string} message     - Human-readable result message
 * @param {*}      [data={}]   - Payload to include in the response
 */
const successResponse = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({ success: true, message, data });

/**
 * Send a standardised error response.
 *
 * Shape: { success: false, message, errors }
 *
 * @param {import('express').Response} res
 * @param {number}   statusCode    - HTTP status (400, 401, 404, 422, 500, etc.)
 * @param {string}   message       - Human-readable error description
 * @param {Array}    [errors=[]]   - Field-level or extra error details
 */
const errorResponse = (res, statusCode, message, errors = []) =>
  res.status(statusCode).json({ success: false, message, errors });

/**
 * Custom operational error with an HTTP status code.
 * Throw this anywhere in the app — errorHandler.js will catch and format it.
 *
 * @example
 *   throw new AppError("Post not found.", 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { successResponse, errorResponse, AppError };
