"use strict";

const express = require("express");
const router  = express.Router();

const adminController = require("../controllers/admin.controller");
const { protect }     = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/rbac.middleware");

// All admin routes require authentication AND admin role
router.use(protect, requireAdmin);

// GET    /api/v1/admin/posts          — all posts (including closed)
router.get("/posts", adminController.getAllPosts);

// PATCH  /api/v1/admin/posts/:id/status  — update roadmap status
router.patch("/posts/:id/status", adminController.updatePostStatus);

// PATCH  /api/v1/admin/posts/:id/pin    — pin / unpin a post
router.patch("/posts/:id/pin", adminController.togglePinPost);

// DELETE /api/v1/admin/posts/:id         — hard delete
router.delete("/posts/:id", adminController.adminDeletePost);

// GET    /api/v1/admin/users
router.get("/users", adminController.getAllUsers);

// PATCH  /api/v1/admin/users/:id/role   — promote / demote
router.patch("/users/:id/role", adminController.updateUserRole);

// GET    /api/v1/admin/stats
router.get("/stats", adminController.getDashboardStats);

module.exports = router;
