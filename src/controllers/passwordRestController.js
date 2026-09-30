const prisma = require("../config/database");
const jwt = require("jsonwebtoken");

const {
  createPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
} = require("../services/passwordResetService");

function normalizeIdentifier(identifier) {
  return String(identifier)
    .trim()
    .replace(/\s+/g, "");
}

async function forgotPassword(req, res) {
  try {
    const { identifier } = req.body || {};

    if (!identifier) {
      return res.status(400).json({
        message: "Email or phone is required",
      });
    }

    const value = normalizeIdentifier(identifier);

    const isEmail = value.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? {
            email: value.toLowerCase(),
          }
        : {
            phone: value,
          },
    });

    /*
     * Don't reveal whether an account exists.
     * This prevents account enumeration.
     */
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists, a password reset OTP has been sent.",
      });
    }

    if (!user.phoneVerified) {
      return res.status(200).json({
        message:
          "If an account exists, a password reset OTP has been sent.",
      });
    }

    const result = await createPasswordResetOtp(
      user.id
    );

    // Development only.
    // Replace with SMS provider later.
    console.log(
      `Password reset OTP for ${user.phone}: ${result.otp}`
    );

    return res.status(200).json({
      message:
        "If an account exists, a password reset OTP has been sent.",
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to process password reset request",
    });
  }
}

async function verifyResetOtp(req, res) {
  try {
    const {
      identifier,
      otp,
    } = req.body || {};

    if (!identifier || !otp) {
      return res.status(400).json({
        message:
          "Email/phone and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        message: "OTP must be 6 digits",
      });
    }

    const value = normalizeIdentifier(identifier);

    const isEmail = value.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? {
            email: value.toLowerCase(),
          }
        : {
            phone: value,
          },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid reset request",
      });
    }

    await verifyPasswordResetOtp(
      user.id,
      otp
    );

    const resetToken = jwt.sign(
      {
        userId: user.id,
        purpose: "password-reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      message:
        "Reset OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error(
      "Verify reset OTP error:",
      error
    );

    if (
      error.message ===
        "Reset OTP not found. Please request a new OTP" ||
      error.message === "Reset OTP has expired" ||
      error.message ===
        "Maximum OTP attempts exceeded" ||
      error.message === "Invalid reset OTP"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        "Failed to verify reset OTP",
    });
  }
}

async function resetUserPassword(req, res) {
  try {
    const {
      resetToken,
      newPassword,
    } = req.body || {};

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message:
          "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message:
          "Invalid or expired reset token",
      });
    }

    if (
      decoded.purpose !== "password-reset"
    ) {
      return res.status(401).json({
        message: "Invalid reset token",
      });
    }

    await resetPassword(
      decoded.userId,
      newPassword
    );

    return res.status(200).json({
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to reset password",
    });
  }
}

module.exports = {
  forgotPassword,
  verifyResetOtp,
  resetUserPassword
};