"use strict";

const REFRESH_COOKIE_NAME = "refreshToken";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Attach the refresh token as a secure httpOnly cookie.
 * @param {import('express').Response} res
 * @param {string} token - Signed JWT refresh token
 */
const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: MAX_AGE_MS,
  });
};

/**
 * Clear the refresh token cookie (logout).
 * @param {import('express').Response} res
 */
const clearRefreshCookie = (res) => {
  res.cookie(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });
};

module.exports = { setRefreshCookie, clearRefreshCookie };
