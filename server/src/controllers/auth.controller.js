"use strict";

const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User.model");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt.utils");
const { setRefreshCookie, clearRefreshCookie }                           = require("../utils/cookie.utils");
const { successResponse, errorResponse }                                 = require("../utils/apiResponse");
const { sendVerificationEmail, sendPasswordResetEmail }                  = require("../config/email");

// ── Tiny helper: SHA-256 hex digest ──────────────────────────────────────────
const sha256 = (str) => crypto.createHash("sha256").update(str).digest("hex");

// ── 1. signup ─────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/signup
 * Creates a new (unverified) user and emails a verification link.
 * bcrypt hashing (12 rounds) is handled by the User pre-save hook.
 */
const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Reject duplicates early (also caught by the unique index → 409 in errorHandler)
    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse(res, 409, "An account with that email already exists.");
    }

    // Raw token stored as-is (no hashing needed for verification flow)
    const verifyToken   = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    const user = await User.create({
      name:                     username,   // 'name' field in schema
      email,
      password,                             // pre-save hook bcrypt(12)
      emailVerificationToken:   verifyToken,
      emailVerificationExpires: verifyExpires,
    });

    // Fire-and-forget; errors are caught & logged inside sendVerificationEmail
    await sendVerificationEmail(email, verifyToken);

    return successResponse(res, 201, "Account created! Check your email to verify your account.", {
      id:    user._id,
      name:  user.name,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

// ── 2. verifyEmail ────────────────────────────────────────────────────────────
/**
 * GET /api/v1/auth/verify-email/:token
 * Confirms email ownership, marks user as verified, clears token fields.
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken:   token,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return errorResponse(res, 400, "Verification link is invalid or has expired.");
    }

    user.isVerified               = true;
    user.emailVerificationToken   = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, "Email verified successfully. You can now log in.");
  } catch (err) {
    next(err);
  }
};

// ── 3. login ──────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/login
 * Validates credentials, issues access + refresh tokens.
 * Refresh token is bcrypt-hashed before storage (refresh-token rotation pattern).
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select hidden fields needed for auth
    const user = await User.findOne({ email }).select("+password +refreshToken");

    // Timing-safe: same error for unknown email and wrong password
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    if (!user.isVerified) {
      return errorResponse(res, 403, "Please verify your email address before logging in.");
    }

    // Issue tokens
    const payload      = { id: user._id, role: user.role };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store bcrypt hash of refresh token (10 rounds — balance of speed vs security)
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    return successResponse(res, 200, "Logged in successfully.", {
      user:        { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ── 4. refresh ────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/refresh
 * Reads httpOnly refreshToken cookie, validates against stored hash,
 * then rotates both tokens.
 */
const refresh = async (req, res, next) => {
  try {
    const incomingToken = req.cookies?.refreshToken;

    if (!incomingToken) {
      return errorResponse(res, 401, "No refresh token provided.");
    }

    // 1. Verify JWT signature + expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingToken);
    } catch {
      return errorResponse(res, 401, "Refresh token is invalid or has expired.");
    }

    // 2. Load user with stored hash
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || !user.refreshToken) {
      return errorResponse(res, 401, "Session not found — please log in again.");
    }

    // 3. Compare incoming token against stored bcrypt hash
    const isValid = await bcrypt.compare(incomingToken, user.refreshToken);
    if (!isValid) {
      // Possible token reuse — nuke the stored token to force full re-login
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 401, "Token reuse detected. Please log in again.");
    }

    // 4. Rotate: generate fresh tokens
    const payload         = { id: user._id, role: user.role };
    const newAccessToken  = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, newRefreshToken);

    return successResponse(res, 200, "Token refreshed.", { accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

// ── 5. logout ─────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/logout
 * Clears the cookie and nulls the stored refresh-token hash.
 */
const logout = async (req, res, next) => {
  try {
    clearRefreshCookie(res);

    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    }

    return successResponse(res, 200, "Logged out successfully.");
  } catch (err) {
    next(err);
  }
};

// ── 6. forgotPassword ─────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/forgot-password
 * Generates a reset token: raw version → email, SHA-256 hash → DB.
 * Always returns 200 to prevent user enumeration.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const SAFE_MSG  = "If that email is registered you will receive a reset link shortly.";

    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether the email exists
      return successResponse(res, 200, SAFE_MSG);
    }

    const rawToken    = crypto.randomBytes(32).toString("hex");
    const hashedToken = sha256(rawToken);

    user.passwordResetToken   = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 h
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(email, rawToken);

    return successResponse(res, 200, SAFE_MSG);
  } catch (err) {
    next(err);
  }
};

// ── 7. resetPassword ──────────────────────────────────────────────────────────
/**
 * PATCH /api/v1/auth/reset-password/:token
 * Hashes the incoming raw token, finds the matching user, updates password.
 * Pre-save hook re-hashes the password with bcrypt(12).
 * Invalidates all existing sessions by clearing the stored refresh token.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    const hashedToken = sha256(token);

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return errorResponse(res, 400, "Password reset link is invalid or has expired.");
    }

    // Update — pre-save hook handles bcrypt hashing
    user.password             = password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken         = undefined; // force re-login everywhere
    await user.save();

    return successResponse(res, 200, "Password reset successfully. Please log in with your new password.");
  } catch (err) {
    next(err);
  }
};

// ── 8. getMe ──────────────────────────────────────────────────────────────────
/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's public profile (no password hash in result
 * because the schema excludes it by default).
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    return successResponse(res, 200, "User fetched successfully.", { user });
  } catch (err) {
    next(err);
  }
};

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  signup,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
