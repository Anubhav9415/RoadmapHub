/**
 * generate-ethereal-account.js
 * ─────────────────────────────
 * One-off script: generates a free Ethereal test account and prints the
 * values you need to paste into server/.env
 *
 * Run once from the project root:
 *   node server/scripts/generate-ethereal-account.js
 */

"use strict";

const nodemailer = require("nodemailer");

(async () => {
  console.log("⏳  Requesting a free Ethereal account…\n");

  try {
    const account = await nodemailer.createTestAccount();

    console.log("✅  Ethereal account created!\n");
    console.log("Paste these values into  server/.env\n");
    console.log("─".repeat(48));
    console.log(`EMAIL_HOST=${account.smtp.host}`);
    console.log(`EMAIL_PORT=${account.smtp.port}`);
    console.log(`EMAIL_USER=${account.user}`);
    console.log(`EMAIL_PASS=${account.pass}`);
    console.log("─".repeat(48));
    console.log("\n🔗  View sent emails at: https://ethereal.email");
    console.log(`    Login → ${account.user} / ${account.pass}\n`);
    console.log(
      "💡  Tip: the console also prints a direct preview URL for every\n" +
      "    email sent during development — no inbox login needed.\n"
    );
  } catch (err) {
    console.error("❌  Failed to create Ethereal account:", err.message);
    process.exit(1);
  }
})();
