"use strict";

const nodemailer = require("nodemailer");

// ---------------------------------------------------------------------------
// Transporter
// ---------------------------------------------------------------------------
// In development: point EMAIL_* vars to your Ethereal test account.
// In production:  swap to a real SMTP provider (SendGrid, SES, Mailgun, etc.)
// ---------------------------------------------------------------------------

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true only for port 465 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM_ADDRESS = `"Roadmap Portal" <${process.env.EMAIL_USER}>`;
const CLIENT_URL   = process.env.CLIENT_URL || "http://localhost:5173";

// ---------------------------------------------------------------------------
// Helper: send a message and log the Ethereal preview URL in development
// ---------------------------------------------------------------------------
const _send = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);

    // Ethereal captures the message and returns a preview URL — log it so
    // you can click through to see the email without a real inbox.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n📧  Email sent (Ethereal preview): ${previewUrl}\n`);
    } else {
      console.log(`📧  Email sent: messageId=${info.messageId}`);
    }

    return info;
  } catch (err) {
    // Log but never crash the server — email is non-critical for the request cycle
    console.error("❌  Email send failed:", err.message);
  }
};

// ---------------------------------------------------------------------------
// sendVerificationEmail
// ---------------------------------------------------------------------------
/**
 * Send an account-verification email.
 *
 * @param {string} to    - Recipient email address
 * @param {string} token - Opaque verification token (stored on User doc)
 */
const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${CLIENT_URL}/verify-email/${token}`;

  await _send({
    from:    FROM_ADDRESS,
    to,
    subject: "Verify your Roadmap Portal account",
    text: `Hi,\n\nPlease verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThis link expires in 24 hours. If you did not create an account, you can safely ignore this email.\n\nThanks,\nThe Roadmap Portal Team`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:8px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Verify your email address</h2>
        <p style="color:#475569;line-height:1.6;">
          Thanks for signing up! Click the button below to confirm your email address and activate your account.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;margin:24px 0;padding:12px 28px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          Verify Email
        </a>
        <p style="color:#94a3b8;font-size:13px;">
          Or copy this link into your browser:<br/>
          <a href="${verifyUrl}" style="color:#6366f1;">${verifyUrl}</a>
        </p>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;">
          This link expires in <strong>24 hours</strong>. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });
};

// ---------------------------------------------------------------------------
// sendPasswordResetEmail
// ---------------------------------------------------------------------------
/**
 * Send a password-reset email.
 *
 * @param {string} to    - Recipient email address
 * @param {string} token - Opaque reset token (stored hashed on User doc)
 */
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${CLIENT_URL}/reset-password/${token}`;

  await _send({
    from:    FROM_ADDRESS,
    to,
    subject: "Reset your Roadmap Portal password",
    text: `Hi,\n\nWe received a request to reset your password. Click the link below to choose a new one:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request a password reset, please ignore this email.\n\nThanks,\nThe Roadmap Portal Team`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:8px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Reset your password</h2>
        <p style="color:#475569;line-height:1.6;">
          We received a request to reset the password for your Roadmap Portal account.
          Click the button below to choose a new password.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:12px 28px;background:#ef4444;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#94a3b8;font-size:13px;">
          Or copy this link into your browser:<br/>
          <a href="${resetUrl}" style="color:#ef4444;">${resetUrl}</a>
        </p>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;">
          This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email — your password won't change.
        </p>
      </div>
    `,
  });
};

module.exports = { transporter, sendVerificationEmail, sendPasswordResetEmail };
