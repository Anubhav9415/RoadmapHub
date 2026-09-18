"use strict";

const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/roadmap-portal";

  try {
    console.log(`🔌  Connecting to MongoDB at: ${uri}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`\n❌  MongoDB connection error: ${err.message}\n`);
    console.warn("💡  Tip: To connect to MongoDB, either:");
    console.warn("    1. Start your local MongoDB service (e.g. net start MongoDB or mongod)");
    console.warn("    2. Or provide a free MongoDB Atlas connection string in server/.env (MONGODB_URI=mongodb+srv://...)\n");
    throw err;
  }
};

module.exports = connectDB;
