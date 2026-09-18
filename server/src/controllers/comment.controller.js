"use strict";

const Comment = require("../models/Comment.model");
const Post = require("../models/Post.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ── GET /api/v1/comments ─────────────────────────────────────────────────────
const getCommentsByPost = async (req, res, next) => {
  try {
    const postId = req.query.postId || req.params.postId;
    if (!postId) {
      return errorResponse(res, 400, "postId query parameter is required");
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "name username email role")
      .sort({ createdAt: 1 })
      .lean();

    return successResponse(res, 200, "Comments retrieved successfully", { comments });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/v1/comments ────────────────────────────────────────────────────
const createComment = async (req, res, next) => {
  try {
    const { post: postId, body, parentComment } = req.body;
    const authorId = req.user.id || req.user._id;

    if (!postId || !body) {
      return errorResponse(res, 400, "post ID and body are required");
    }

    const targetPost = await Post.findById(postId);
    if (!targetPost) {
      return errorResponse(res, 404, "Post not found");
    }

    const comment = await Comment.create({
      post: postId,
      body,
      author: authorId,
      parentComment: parentComment || null,
      isOfficial: req.user.role === "admin",
    });

    const populated = await comment.populate("author", "name username email role");

    return successResponse(res, 201, "Comment created successfully", { comment: populated });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/v1/comments/:id ───────────────────────────────────────────────
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return errorResponse(res, 404, "Comment not found");
    }

    const userId = (req.user.id || req.user._id).toString();
    const isOwner = comment.author.toString() === userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 403, "You do not have permission to edit this comment");
    }

    const { body } = req.body;
    if (body) comment.body = body;

    await comment.save();
    const updated = await comment.populate("author", "name username email role");

    return successResponse(res, 200, "Comment updated successfully", { comment: updated });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/v1/comments/:id ──────────────────────────────────────────────
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return errorResponse(res, 404, "Comment not found");
    }

    const userId = (req.user.id || req.user._id).toString();
    const isOwner = comment.author.toString() === userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 403, "You do not have permission to delete this comment");
    }

    await Comment.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, "Comment deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
};
