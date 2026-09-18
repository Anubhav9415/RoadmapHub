"use strict";

const { body } = require("express-validator");

const VALID_CATEGORIES = ["feature", "bug", "improvement", "other"];
const VALID_STATUSES   = ["open", "under_review", "planned", "in_progress", "completed", "closed"];

const createPostValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required.")
    .isLength({ max: 150 }).withMessage("Title cannot exceed 150 characters."),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required.")
    .isLength({ max: 5000 }).withMessage("Description cannot exceed 5000 characters."),

  body("category")
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}.`),
];

const updatePostValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage("Title cannot exceed 150 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage("Description cannot exceed 5000 characters."),

  body("category")
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}.`),

  body("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}.`),
];

module.exports = { createPostValidator, updatePostValidator };
