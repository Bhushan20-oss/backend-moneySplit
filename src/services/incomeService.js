const prisma = require("../config/database");

async function createIncome(userId, amount, source, description, incomeDate) {
  const income = await prisma.income.create({
    data: {
      userId: Number(userId),
      amount: amount,
      source: source.trim(),
      description: description?.trim() || null,
      incomeDate: new Date(incomeDate),
    },
  });

  return income;
}

async function getUserIncomes(userId) {
  return await prisma.income.findMany({
    where: {
      userId: Number(userId),
    },
    orderBy: {
      incomeDate: "desc",
    },
  });
}

async function getIncomeById(userId, incomeId) {
  const income = await prisma.income.findFirst({
    where: {
      id: Number(incomeId),
      userId: Number(userId),
    },
  });

  if (!income) {
    throw new Error("Income not found");
  }

  return income;
}

async function updateIncome(
  userId,
  incomeId,
  amount,
  source,
  description,
  incomeDate
) {
  const existingIncome = await prisma.income.findFirst({
    where: {
      id: Number(incomeId),
      userId: Number(userId),
    },
  });

  if (!existingIncome) {
    throw new Error("Income not found");
  }

  const income = await prisma.income.update({
    where: {
      id: Number(incomeId),
    },
    data: {
      amount,
      source: source.trim(),
      description: description?.trim() || null,
      incomeDate: new Date(incomeDate),
    },
  });

  return income;
}

async function deleteIncome(userId, incomeId) {
  const existingIncome = await prisma.income.findFirst({
    where: {
      id: Number(incomeId),
      userId: Number(userId),
    },
  });

  if (!existingIncome) {
    throw new Error("Income not found");
  }

  await prisma.income.delete({
    where: {
      id: Number(incomeId),
    },
  });

  return true;
}

module.exports = {
  createIncome,
  getUserIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
};