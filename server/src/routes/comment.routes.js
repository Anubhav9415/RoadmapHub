"use strict";

const express = require("express");
const router  = express.Router();

const commentController = require("../controllers/comment.controller");
const { protect }       = require("../middleware/auth.middleware");

// GET    /api/v1/comments?postId=:postId
router.get("/", commentController.getCommentsByPost);

// POST   /api/v1/comments
router.post("/", protect, commentController.createComment);

// PATCH  /api/v1/comments/:id  — author or admin only
router.patch("/:id", protect, commentController.updateComment);

// DELETE /api/v1/comments/:id  — author or admin only
router.delete("/:id", protect, commentController.deleteComment);

module.exports = router;
