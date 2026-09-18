"use strict";

const express = require("express");
const router  = express.Router();

const postController  = require("../controllers/post.controller");
const { protect }     = require("../middleware/auth.middleware");
const { validate }    = require("../middleware/validate.middleware");
const { createPostValidator, updatePostValidator } = require("../validators/post.validator");

// GET    /api/v1/posts          — public feed (filterable, sortable, paginated)
router.get("/",    postController.getPosts);

// GET    /api/v1/posts/:id
router.get("/:id", postController.getPostById);

// POST   /api/v1/posts          — authenticated users only
router.post(
  "/",
  protect,
  createPostValidator,
  validate,
  postController.createPost
);

// PATCH  /api/v1/posts/:id      — owner or admin
router.patch(
  "/:id",
  protect,
  updatePostValidator,
  validate,
  postController.updatePost
);

// DELETE /api/v1/posts/:id      — owner or admin
router.delete("/:id", protect, postController.deletePost);

// POST   /api/v1/posts/:id/upvote  — toggle upvote
router.post("/:id/upvote", protect, postController.toggleUpvote);

module.exports = router;
