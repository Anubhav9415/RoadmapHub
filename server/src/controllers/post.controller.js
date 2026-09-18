"use strict";

const Post = require("../models/Post.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ── GET /api/v1/posts ────────────────────────────────────────────────────────
const getPosts = async (req, res, next) => {
  try {
    const { category, status, search, sort = "top", page = 1, limit = 50 } = req.query;

    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    let sortOptions = { upvoteCount: -1, createdAt: -1 };
    if (sort === "newest") {
      sortOptions = { createdAt: -1 };
    } else if (sort === "commented") {
      sortOptions = { commentCount: -1, createdAt: -1 };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name username email role")
        .sort(sortOptions)
        .skip(skip)
        .limit(take)
        .lean(),
      Post.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Posts retrieved successfully", {
      posts,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / take) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/v1/posts/:id ────────────────────────────────────────────────────
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name username email role")
      .lean();

    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    return successResponse(res, 200, "Post retrieved successfully", { post });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/v1/posts ───────────────────────────────────────────────────────
const createPost = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const authorId = req.user.id || req.user._id;

    const post = await Post.create({
      title,
      description,
      category: category || "feature",
      author: authorId,
    });

    const populated = await post.populate("author", "name username email role");

    return successResponse(res, 201, "Feature request submitted successfully", { post: populated });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/v1/posts/:id ──────────────────────────────────────────────────
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    const userId = (req.user.id || req.user._id).toString();
    const isOwner = post.author.toString() === userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 403, "You do not have permission to edit this post");
    }

    const { title, description, category } = req.body;
    if (title) post.title = title;
    if (description) post.description = description;
    if (category) post.category = category;

    await post.save();
    const updated = await post.populate("author", "name username email role");

    return successResponse(res, 200, "Post updated successfully", { post: updated });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/v1/posts/:id ─────────────────────────────────────────────────
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    const userId = (req.user.id || req.user._id).toString();
    const isOwner = post.author.toString() === userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 403, "You do not have permission to delete this post");
    }

    await Post.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, "Post deleted successfully");
  } catch (err) {
    next(err);
  }
};

// ── POST /api/v1/posts/:id/upvote ────────────────────────────────────────────
const toggleUpvote = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    const hasVoted = post.upvotes.some((u) => u.toString() === userId.toString());

    let updatedPost;
    if (hasVoted) {
      // Remove upvote
      updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { upvotes: userId },
          $inc: { upvoteCount: -1 },
        },
        { new: true }
      ).populate("author", "name username email role");
    } else {
      // Add upvote
      updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: { upvotes: userId },
          $inc: { upvoteCount: 1 },
        },
        { new: true }
      ).populate("author", "name username email role");
    }

    return successResponse(res, 200, hasVoted ? "Vote removed" : "Upvoted!", {
      post: updatedPost,
      hasVoted: !hasVoted,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleUpvote,
};
