const bcrypt = require("bcrypt");

const prisma = require("../config/database");

// ==============================
// REGISTER
// ==============================

async function registerUser(
  name,
  email,
  phone,
  password
) {
  const existingEmail =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingEmail) {
    throw new Error(
      "Email is already registered"
    );
  }

  const existingPhone =
    await prisma.user.findUnique({
      where: {
        phone,
      },
    });

  if (existingPhone) {
    throw new Error(
      "Phone number is already registered"
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      phoneVerified: false,
    },
  });

  return user;
}

// ==============================
// LOGIN
// ==============================

async function loginUser(
  identifier,
  password
) {
  const value = identifier
    .trim();

  const isEmail =
    value.includes("@");

  const user =
    await prisma.user.findFirst({
      where: isEmail
        ? {
            email:
              value.toLowerCase(),
          }
        : {
            phone:
              value.replace(
                /\s+/g,
                ""
              ),
          },
    });

  if (!user) {
    throw new Error(
      "Invalid email/phone or password"
    );
  }

  const isPasswordValid =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

  if (!isPasswordValid) {
    throw new Error(
      "Invalid email/phone or password"
    );
  }

  if (!user.phoneVerified) {
    throw new Error(
      "Phone number is not verified"
    );
  }

  return user;
}

// ==============================
// CHANGE PASSWORD
// ==============================

async function changePassword(
  userId,
  currentPassword,
  newPassword
) {
  const user =
    await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  const currentPasswordValid =
    await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

  if (!currentPasswordValid) {
    throw new Error(
      "Current password is incorrect"
    );
  }

  const samePassword =
    await bcrypt.compare(
      newPassword,
      user.passwordHash
    );

  if (samePassword) {
    throw new Error(
      "New password must be different from current password"
    );
  }

  const passwordHash =
    await bcrypt.hash(
      newPassword,
      10
    );

  await prisma.user.update({
    where: {
      id: Number(userId),
    },
    data: {
      passwordHash,
    },
  });

  return true;
}

// ==============================
// GET PROFILE
// ==============================

async function getUserProfile(
  userId
) {
  const user =
    await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  return user;
}

// ==============================
// UPDATE PROFILE
// ==============================

async function updateUserProfile(
  userId,
  name
) {
  if (!name || !name.trim()) {
    throw new Error(
      "Name is required"
    );
  }

  const user =
    await prisma.user.update({
      where: {
        id: Number(userId),
      },

      data: {
        name: name.trim(),
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return user;
}

// ==============================
// EXPORTS
// ==============================

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  getUserProfile,
  updateUserProfile,
};