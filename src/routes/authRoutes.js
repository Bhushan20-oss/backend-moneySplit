const express = require("express");

const {
  register,
  login,
  changeUserPassword,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const {
  sendOtp,
  resendOtp,
  verifyOtp,
} = require("../controllers/otpController");

// IMPORTANT:
// Check the actual filename in your controllers folder.
// This version assumes:
// passwordResetController.js
const {
  forgotPassword,
  verifyResetOtp,
  resetUserPassword,
} = require("../controllers/passwordRestController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==============================
// REGISTER & LOGIN
// ==============================

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

// ==============================
// PHONE OTP
// ==============================

router.post(
  "/send-otp",
  sendOtp
);

router.post(
  "/resend-otp",
  resendOtp
);

router.post(
  "/verify-phone",
  verifyOtp
);

// ==============================
// PASSWORD RESET
// ==============================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyResetOtp
);

router.post(
  "/reset-password",
  resetUserPassword
);

// ==============================
// LOGGED-IN USER
// ==============================

router.post(
  "/change-password",
  authMiddleware,
  changeUserPassword
);

router.get(
  "/me",
  authMiddleware,
  getProfile
);

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

module.exports = router;