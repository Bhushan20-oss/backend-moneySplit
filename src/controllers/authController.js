const jwt = require("jsonwebtoken");

const {
  registerUser,
  loginUser,
  changePassword,
  getUserProfile,
  updateUserProfile,
} = require("../services/authService");

const {
  createPhoneOtp,
} = require("../services/otpService");

// ==============================
// HELPERS
// ==============================

function normalizePhone(phone) {
  return String(phone)
    .replace(/\s+/g, "")
    .trim();
}

// ==============================
// REGISTER
// ==============================

async function register(req, res) {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body || {};

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message:
          "Name, email, phone and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const normalizedPhone =
      normalizePhone(phone);

    if (
      !/^\+?[1-9]\d{9,14}$/.test(
        normalizedPhone
      )
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid phone number",
      });
    }

    const user = await registerUser(
      name.trim(),
      normalizedEmail,
      normalizedPhone,
      password
    );

    const otpResult =
      await createPhoneOtp(user.id);

    // Development only
    console.log(
      `OTP for ${normalizedPhone}: ${otpResult.otp}`
    );

    return res.status(201).json({
      message:
        "Registration successful. Please verify your phone number.",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
      },

      otpExpiresAt: otpResult.expiresAt,
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    if (
      error.message ===
        "Email is already registered" ||
      error.message ===
        "Phone number is already registered"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Registration failed",
    });
  }
}

// ==============================
// LOGIN
// ==============================

async function login(req, res) {
  try {
    const {
      identifier,
      password,
    } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({
        message:
          "Email/phone and password are required",
      });
    }

    const user = await loginUser(
      identifier,
      password
    );

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN ||
          "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneVerified:
          user.phoneVerified,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    if (
      error.message ===
      "Invalid email/phone or password"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "Phone number is not verified"
    ) {
      return res.status(403).json({
        message:
          "Phone number is not verified. Please verify your phone number before logging in.",
      });
    }

    return res.status(500).json({
      message: "Login failed",
    });
  }
}

// ==============================
// CHANGE PASSWORD
// ==============================

async function changeUserPassword(
  req,
  res
) {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body || {};

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters",
      });
    }

    if (
      currentPassword === newPassword
    ) {
      return res.status(400).json({
        message:
          "New password must be different from current password",
      });
    }

    await changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    if (
      error.message === "User not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "Current password is incorrect"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "New password must be different from current password"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        "Failed to change password",
    });
  }
}

// ==============================
// GET PROFILE
// ==============================

async function getProfile(req, res) {
  try {
    const user = await getUserProfile(
      req.user.userId
    );

    return res.status(200).json({
      message:
        "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    if (
      error.message === "User not found"
    ) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(500).json({
      message:
        "Failed to fetch profile",
    });
  }
}

// ==============================
// UPDATE PROFILE
// ==============================

async function updateProfile(req, res) {
  try {
    const { name } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const user =
      await updateUserProfile(
        req.user.userId,
        name
      );

    return res.status(200).json({
      message:
        "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    if (
      error.message === "User not found"
    ) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(500).json({
      message:
        "Failed to update profile",
    });
  }
}

// ==============================
// EXPORTS
// ==============================

module.exports = {
  register,
  login,
  changeUserPassword,
  getProfile,
  updateProfile,
};