"use strict";

const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Comment = require("../models/Comment.model");

const seedSampleData = async () => {
  const postCount = await Post.countDocuments();
  if (postCount > 0) return;

  console.log("🌱  Seeding initial sample feature requests and comments...");

  // Find or create a demo user
  let demoUser = await User.findOne({ email: "demo@portal.local" });
  if (!demoUser) {
    demoUser = await User.create({
      name: "Sarah Jenkins",
      email: "demo@portal.local",
      password: "Password123!",
      role: "user",
      isVerified: true,
    });
  }

  let adminUser = await User.findOne({ role: "admin" });
  if (!adminUser) {
    adminUser = demoUser;
  }

  const samplePosts = [
    {
      title: "Dark Mode Theme Support",
      description: "Please add a sleek dark mode theme that respects system preferences and reduces eye strain during late-night work sessions.",
      category: "feature",
      status: "in_progress",
      author: demoUser._id,
      upvotes: [demoUser._id],
      upvoteCount: 14,
      commentCount: 2,
    },
    {
      title: "Slack & Discord Webhook Notifications",
      description: "Allow workspace admins to configure outgoing webhooks so our team receives live alerts whenever a high-impact feature request is created or status changes.",
      category: "feature",
      status: "planned",
      author: adminUser._id,
      upvotes: [adminUser._id, demoUser._id],
      upvoteCount: 28,
      commentCount: 1,
    },
    {
      title: "CSV / JSON Export for Roadmap Analytics",
      description: "We need the ability to export feature request votes, categories, and author details into CSV for quarterly product reporting.",
      category: "improvement",
      status: "completed",
      author: demoUser._id,
      upvotes: [demoUser._id],
      upvoteCount: 9,
      commentCount: 0,
    },
    {
      title: "GitHub Issues Two-Way Synchronization",
      description: "Automatically link roadmap items to GitHub Issues so engineers and product managers stay in sync without dual data entry.",
      category: "feature",
      status: "under_review",
      author: demoUser._id,
      upvotes: [demoUser._id],
      upvoteCount: 42,
      commentCount: 3,
    },
    {
      title: "Mobile App for iOS & Android",
      description: "A native mobile app or high performance PWA to quickly check roadmap statuses and vote on the go.",
      category: "feature",
      status: "open",
      author: demoUser._id,
      upvotes: [demoUser._id],
      upvoteCount: 19,
      commentCount: 1,
    },
  ];

  const createdPosts = await Post.insertMany(samplePosts);

  // Add sample comments
  await Comment.create({
    body: "We are actively prototyping dark mode palettes right now! Aiming to ship next sprint.",
    post: createdPosts[0]._id,
    author: adminUser._id,
    isOfficial: true,
  });

  await Comment.create({
    body: "Awesome! Please make sure pure OLED black is supported alongside dark slate.",
    post: createdPosts[0]._id,
    author: demoUser._id,
  });

  await Comment.create({
    body: "Webhooks for Slack would be a gamechanger for our triage team.",
    post: createdPosts[1]._id,
    author: demoUser._id,
  });

  console.log("✅  Sample data seeded successfully!");
};

module.exports = seedSampleData;
