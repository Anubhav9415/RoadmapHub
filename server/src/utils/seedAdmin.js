"use strict";

const User = require("../models/User.model");

/**
 * Seeds a single admin user on server startup.
 * Reads credentials from environment variables:
 *   ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD
 *
 * Safe to call every boot — skips if the admin already exists.
 */
const seedAdmin = async () => {
  const email    = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.warn("⚠️   ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD not set — skipping admin seed.");
    return;
  }

  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`ℹ️   Admin user already exists (${email}) — skipping seed.`);
    return;
  }

  await User.create({
    name:       "Admin",
    email,
    password,
    role:       "admin",
    isVerified: true,
  });

  console.log(`✅  Admin user seeded successfully (${email})`);
};

module.exports = seedAdmin;
