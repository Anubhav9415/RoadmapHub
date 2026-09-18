"use strict";

const { verifyAccessToken } = require("../utils/jwt.utils");
const { errorResponse }     = require("../utils/apiResponse");

/**
 * protect — authenticate every request on guarded routes.
 *
 * Reads the Bearer token from the Authorization header:
 *   Authorization: Bearer <accessToken>
 *
 * On success: attaches the decoded JWT payload to req.user and calls next().
 * On failure: returns 401 immediately.
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Not authorised — no token provided.");
    }

    const token   = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token); // throws on invalid / expired

    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token has expired — please log in again.");
    }
    return errorResponse(res, 401, "Not authorised — invalid token.");
  }
};

module.exports = { protect };
