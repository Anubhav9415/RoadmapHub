"use strict";

require("dotenv").config();

const app            = require("./app");
const connectDB      = require("./src/config/db");
const seedAdmin      = require("./src/utils/seedAdmin");
const seedSampleData = require("./src/utils/seedSampleData");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Seed the admin user if it doesn't already exist
    await seedAdmin();

    // 3. Seed initial sample feedback and comments
    await seedSampleData();

    // 4. Start the HTTP server
    app.listen(PORT, () => {
      console.log(`\n🚀  Server running in [${process.env.NODE_ENV || "development"}] mode`);
      console.log(`📡  Listening on http://localhost:${PORT}`);
      console.log(`🔗  API base: http://localhost:${PORT}/api/v1\n`);
    });
  } catch (err) {
    console.error("❌  Server failed to start:", err.message);
    process.exit(1);
  }
})();
