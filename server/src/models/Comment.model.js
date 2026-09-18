"use strict";

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, "Comment body is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Support one level of nested replies
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // Mark admin/official responses
    isOfficial: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ author: 1 });

// ── After saving a comment: increment Post.commentCount ───────────────────────
commentSchema.post("save", async function () {
  await mongoose.model("Post").findByIdAndUpdate(this.post, {
    $inc: { commentCount: 1 },
  });
});

// ── After deleting a comment: decrement Post.commentCount ─────────────────────
commentSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Post").findByIdAndUpdate(doc.post, {
      $inc: { commentCount: -1 },
    });
  }
});

module.exports = mongoose.model("Comment", commentSchema);
