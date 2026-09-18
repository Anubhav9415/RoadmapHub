"use strict";

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    category: {
      type: String,
      enum: ["feature", "bug", "improvement", "other"],
      default: "feature",
    },

    status: {
      type: String,
      enum: ["open", "under_review", "planned", "in_progress", "completed", "closed"],
      default: "open",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Users who upvoted this post
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    upvoteCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },

    // Admin notes / internal roadmap details
    adminNote: {
      type: String,
      maxlength: [2000, "Admin note cannot exceed 2000 characters"],
    },

    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
postSchema.index({ status: 1, upvoteCount: -1 });
postSchema.index({ author: 1 });

// ── Auto-generate slug from title before saving ───────────────────────────────
postSchema.pre("validate", function (next) {
  if (this.isNew || this.isModified("title")) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-") +
      "-" +
      Date.now();
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
