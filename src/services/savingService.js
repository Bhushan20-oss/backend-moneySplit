const prisma = require("../config/database");

async function createSaving(
  userId,
  amount,
  savingType,
  description,
  savingDate
) {
  const saving = await prisma.saving.create({
    data: {
      userId: Number(userId),
      amount,
      savingType: savingType.trim(),
      description: description?.trim() || null,
      savingDate: new Date(savingDate),
    },
  });

  return saving;
}

async function getUserSavings(userId) {
  return await prisma.saving.findMany({
    where: {
      userId: Number(userId),
    },
    orderBy: {
      savingDate: "desc",
    },
  });
}

async function getSavingById(userId, savingId) {
  const saving = await prisma.saving.findFirst({
    where: {
      id: Number(savingId),
      userId: Number(userId),
    },
  });

  if (!saving) {
    throw new Error("Saving not found");
  }

  return saving;
}

async function updateSaving(
  userId,
  savingId,
  amount,
  savingType,
  description,
  savingDate
) {
  const existingSaving = await prisma.saving.findFirst({
    where: {
      id: Number(savingId),
      userId: Number(userId),
    },
  });

  if (!existingSaving) {
    throw new Error("Saving not found");
  }

  const saving = await prisma.saving.update({
    where: {
      id: Number(savingId),
    },
    data: {
      amount,
      savingType: savingType.trim(),
      description: description?.trim() || null,
      savingDate: new Date(savingDate),
    },
  });

  return saving;
}

async function deleteSaving(userId, savingId) {
  const existingSaving = await prisma.saving.findFirst({
    where: {
      id: Number(savingId),
      userId: Number(userId),
    },
  });

  if (!existingSaving) {
    throw new Error("Saving not found");
  }

  await prisma.saving.delete({
    where: {
      id: Number(savingId),
    },
  });

  return true;
}

module.exports = {
  createSaving,
  getUserSavings,
  getSavingById,
  updateSaving,
  deleteSaving,
};