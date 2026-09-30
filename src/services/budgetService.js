const prisma = require("../config/database");

async function createBudget(
  userId,
  category,
  amount,
  month,
  year
) {
  const existingBudget = await prisma.budget.findFirst({
    where: {
      userId: Number(userId),
      category: category.trim(),
      month: Number(month),
      year: Number(year),
    },
  });

  if (existingBudget) {
    throw new Error(
      "Budget already exists for this category and month"
    );
  }

  const budget = await prisma.budget.create({
    data: {
      userId: Number(userId),
      category: category.trim(),
      amount,
      month: Number(month),
      year: Number(year),
    },
  });

  return budget;
}

async function getUserBudgets(userId, month, year) {
  const where = {
    userId: Number(userId),
  };

  if (month !== undefined && year !== undefined) {
    where.month = Number(month);
    where.year = Number(year);
  }

  return await prisma.budget.findMany({
    where,
    orderBy: {
      category: "asc",
    },
  });
}

async function getBudgetById(userId, budgetId) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: Number(budgetId),
      userId: Number(userId),
    },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  return budget;
}

async function updateBudget(
  userId,
  budgetId,
  category,
  amount,
  month,
  year
) {
  const existingBudget = await prisma.budget.findFirst({
    where: {
      id: Number(budgetId),
      userId: Number(userId),
    },
  });

  if (!existingBudget) {
    throw new Error("Budget not found");
  }

  const duplicateBudget = await prisma.budget.findFirst({
    where: {
      userId: Number(userId),
      category: category.trim(),
      month: Number(month),
      year: Number(year),
      NOT: {
        id: Number(budgetId),
      },
    },
  });

  if (duplicateBudget) {
    throw new Error(
      "Budget already exists for this category and month"
    );
  }

  const budget = await prisma.budget.update({
    where: {
      id: Number(budgetId),
    },
    data: {
      category: category.trim(),
      amount,
      month: Number(month),
      year: Number(year),
    },
  });

  return budget;
}

async function deleteBudget(userId, budgetId) {
  const existingBudget = await prisma.budget.findFirst({
    where: {
      id: Number(budgetId),
      userId: Number(userId),
    },
  });

  if (!existingBudget) {
    throw new Error("Budget not found");
  }

  await prisma.budget.delete({
    where: {
      id: Number(budgetId),
    },
  });

  return true;
}

module.exports = {
  createBudget,
  getUserBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};