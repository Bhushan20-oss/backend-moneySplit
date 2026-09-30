const prisma = require("../config/database");

async function createExpense(userId, data) {
  const expense = await prisma.expense.create({
    data: {
      userId: Number(userId),
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      expenseDate: new Date(data.expenseDate),
    },
  });

  return expense;
}

async function getExpenses(userId) {
  const expenses = await prisma.expense.findMany({
    where: {
      userId: Number(userId),
    },
    orderBy: {
      expenseDate: "desc",
    },
  });

  return expenses;
}

async function updateExpense(userId, expenseId, data) {
  const existingExpense = await prisma.expense.findFirst({
    where: {
      id: Number(expenseId),
      userId: Number(userId),
    },
  });

  if (!existingExpense) {
    throw new Error("Expense not found");
  }

  const expense = await prisma.expense.update({
    where: {
      id: Number(expenseId),
    },
    data: {
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      expenseDate: new Date(data.expenseDate),
    },
  });

  return expense;
}

async function deleteExpense(userId, expenseId) {
  const existingExpense = await prisma.expense.findFirst({
    where: {
      id: Number(expenseId),
      userId: Number(userId),
    },
  });

  if (!existingExpense) {
    throw new Error("Expense not found");
  }

  await prisma.expense.delete({
    where: {
      id: Number(expenseId),
    },
  });
}

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};