const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma = require("../config/database");

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function createPasswordResetOtp(userId) {
  // Invalidate previous reset OTPs
  await prisma.passwordResetOtp.updateMany({
    where: {
      userId: Number(userId),
      verified: false,
    },
    data: {
      verified: true,
    },
  });

  const otp = generateOtp();

  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  const otpRecord = await prisma.passwordResetOtp.create({
    data: {
      userId: Number(userId),
      otpHash,
      expiresAt,
    },
  });

  return {
    otp,
    otpId: otpRecord.id,
    expiresAt,
  };
}

async function verifyPasswordResetOtp(userId, otp) {
  const otpRecord =
    await prisma.passwordResetOtp.findFirst({
      where: {
        userId: Number(userId),
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (!otpRecord) {
    throw new Error(
      "Reset OTP not found. Please request a new OTP"
    );
  }

  if (new Date() > otpRecord.expiresAt) {
    throw new Error("Reset OTP has expired");
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error(
      "Maximum OTP attempts exceeded"
    );
  }

  const isValid = await bcrypt.compare(
    String(otp),
    otpRecord.otpHash
  );

  if (!isValid) {
    await prisma.passwordResetOtp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw new Error("Invalid reset OTP");
  }

  await prisma.passwordResetOtp.update({
    where: {
      id: otpRecord.id,
    },
    data: {
      verified: true,
    },
  });

  return true;
}

async function resetPassword(userId, newPassword) {
  const passwordHash = await bcrypt.hash(
    newPassword,
    10
  );

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        passwordHash,
      },
    }),

    prisma.passwordResetOtp.updateMany({
      where: {
        userId: Number(userId),
        verified: true,
      },
      data: {
        verified: true,
      },
    }),
  ]);

  return true;
}

module.exports = {
  createPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
};