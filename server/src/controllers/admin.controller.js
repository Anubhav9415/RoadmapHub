"use strict";

const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Comment = require("../models/Comment.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ── GET /api/v1/admin/posts ──────────────────────────────────────────────────
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "name username email role")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, "All posts retrieved for admin", { posts });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/v1/admin/posts/:id/status ─────────────────────────────────────
const updatePostStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    if (status) post.status = status;
    if (adminNote !== undefined) post.adminNote = adminNote;

    await post.save();
    const updated = await post.populate("author", "name username email role");

    return successResponse(res, 200, `Post status updated to ${status}`, { post: updated });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/v1/admin/posts/:id/pin ────────────────────────────────────────
const togglePinPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    post.isPinned = !post.isPinned;
    await post.save();

    return successResponse(res, 200, `Post ${post.isPinned ? "pinned" : "unpinned"}`, {
      post,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/v1/admin/posts/:id ───────────────────────────────────────────
const adminDeletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    // Delete all associated comments
    await Comment.deleteMany({ post: req.params.id });

    return successResponse(res, 200, "Post and associated comments permanently deleted");
  } catch (err) {
    next(err);
  }
};

// ── GET /api/v1/admin/users ──────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-passwordHash -refreshTokenHash -emailVerificationToken -passwordResetToken")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, "All users retrieved for admin", { users });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/v1/admin/users/:id/role ───────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return errorResponse(res, 400, "Role must be 'user' or 'admin'");
    }

    const currentAdminId = (req.user.id || req.user._id).toString();
    if (req.params.id === currentAdminId) {
      return errorResponse(res, 400, "Administrators cannot modify their own role");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-passwordHash -refreshTokenHash");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "User role updated successfully", { user });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/v1/admin/stats ──────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPosts, totalComments, statusBreakdown] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Post.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    return successResponse(res, 200, "Dashboard stats retrieved", {
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        statusBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPosts,
  updatePostStatus,
  togglePinPost,
  adminDeletePost,
  getAllUsers,
  updateUserRole,
  getDashboardStats,
};
