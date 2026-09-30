const prisma = require("../config/database");

const {
  createPhoneOtp,
  verifyPhoneOtp,
} = require("../services/otpService");

async function sendOtp(req, res) {
  try {
    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.phone) {
      return res.status(400).json({
        message: "Phone number is not registered",
      });
    }

    if (user.phoneVerified) {
      return res.status(400).json({
        message: "Phone number is already verified",
      });
    }

    const result = await createPhoneOtp(user.id);

    // Development only.
    // Replace with SMS provider in production.
    console.log(
      `OTP for ${user.phone}: ${result.otp}`
    );

    return res.status(200).json({
      message: "OTP sent successfully",
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
}

async function resendOtp(req, res) {
  try {
    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.phone) {
      return res.status(400).json({
        message: "Phone number is not registered",
      });
    }

    if (user.phoneVerified) {
      return res.status(400).json({
        message: "Phone number is already verified",
      });
    }

    const result = await createPhoneOtp(user.id);

    // Development only.
    // Replace with SMS provider in production.
    console.log(
      `New OTP for ${user.phone}: ${result.otp}`
    );

    return res.status(200).json({
      message: "New OTP sent successfully",
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      message: "Failed to resend OTP",
    });
  }
}

async function verifyOtp(req, res) {
  try {
    const { userId, otp } = req.body || {};

    if (!userId || !otp) {
      return res.status(400).json({
        message: "User ID and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        message: "OTP must be 6 digits",
      });
    }

    await verifyPhoneOtp(userId, otp);

    return res.status(200).json({
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    if (
      error.message ===
        "OTP not found. Please request a new OTP" ||
      error.message === "OTP has expired" ||
      error.message ===
        "Maximum OTP attempts exceeded" ||
      error.message === "Invalid OTP"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
}

module.exports = {
  sendOtp,
  resendOtp,
  verifyOtp,
};