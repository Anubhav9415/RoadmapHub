"use strict";

const express = require("express");
const router  = express.Router();

const authController = require("../controllers/auth.controller");
const { protect }    = require("../middleware/auth.middleware");
const { validate }   = require("../middleware/validate.middleware");
const {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require("../validators/auth.validator");

// ── Public routes (no auth required) ─────────────────────────────────────────

// POST /api/v1/auth/signup
router.post("/signup",        validateSignup,         validate, authController.signup);

// POST /api/v1/auth/login
router.post("/login",         validateLogin,          validate, authController.login);

// POST /api/v1/auth/refresh  (reads httpOnly cookie — no Bearer token needed)
router.post("/refresh",       authController.refresh);

// POST /api/v1/auth/forgot-password
router.post("/forgot-password", validateForgotPassword, validate, authController.forgotPassword);

// PATCH /api/v1/auth/reset-password/:token
router.patch("/reset-password/:token", validateResetPassword, validate, authController.resetPassword);

// GET /api/v1/auth/verify-email/:token
router.get("/verify-email/:token", authController.verifyEmail);

// ── Protected routes (valid accessToken required) ─────────────────────────────

// GET  /api/v1/auth/me
router.get("/me",      protect, authController.getMe);

// POST /api/v1/auth/logout
router.post("/logout", protect, authController.logout);

module.exports = router;
